require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Groq = require('groq-sdk');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');

// Import Prisma ORM Client
const prisma = require('./config/prisma');
const path = require('path');

// API Configurations & Express App Initialization
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5000'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve Static Frontend Files (production React build or legacy fallback)
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use(express.static(path.join(__dirname, '../frontend'), {
    extensions: ['html', 'htm']
}));

// Basic route to test server
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Express server is running' });
});

// --- MODULE 1: Google Authentication Setup ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Note: Replace with actual client ID in .env
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ error: 'Missing Google credential' });
        }

        // Verify the Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        // The payload contains the user's data from Google
        const payload = ticket.getPayload();
        const { sub: google_id, name, email, picture: profile_picture } = payload;
        
        // --- MODULE 2: Update Users Database via Prisma ---
        let user = await prisma.user.findFirst({ where: { google_id } });

        if (user) {
            // User exists, log them in & update details if changed
            if (user.name !== name || user.profile_picture !== profile_picture) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { name, profile_picture }
                });
            }
        } else {
            // New user, create
            user = await prisma.user.create({
                data: { google_id, name, email, profile_picture, auth_provider: 'google' }
            });
        }

        // --- MODULE 3: Authentication Session (JWT) ---
        const JWT_SECRET = process.env.JWT_SECRET || 'verifiai_super_secret_dev_key';
        
        // Ensure token expires after 24 hours (MODULE 9: Security)
        const token = jwt.sign({ id: user.id, google_id: user.google_id }, JWT_SECRET, { expiresIn: '24h' });

        // Set token in an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true if https
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
            sameSite: 'strict'
        });

        return res.status(200).json({
            status: 'success',
            message: 'Authentication successful',
            user: { id: user.id, name: user.name, email: user.email, profile_picture: user.profile_picture }
        });

    } catch (error) {
        console.error('Error verifying Google Auth token:', error);
        return res.status(401).json({ error: 'Invalid Google Authentication token.' });
    }
});

// --- MODULE 3: Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Access denied. No authentication token provided.' });

    const JWT_SECRET = process.env.JWT_SECRET || 'verifiai_super_secret_dev_key';
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

// --- Optional: authenticate API logic for users but allow guests ---
const authenticateOptional = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        req.user = null;
        return next();
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'verifiai_super_secret_dev_key';
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) req.user = null;
        else req.user = user;
        next();
    });
};

// Fetch current user details
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, google_id: true, name: true, email: true, profile_picture: true, auth_provider: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        return res.json({ status: 'success', user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server error fetching user details' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ status: 'success', message: 'Logged out successfully' });
});

// --- LOCAL AUTH: Registration ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        // Check for existing user by email
        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
        }

        // Hash password and create user
        const password_hash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password_hash,
                auth_provider: 'local',
                google_id: null
            }
        });

        // Issue JWT cookie
        const JWT_SECRET = process.env.JWT_SECRET || 'verifiai_super_secret_dev_key';
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });

        return res.status(201).json({
            status: 'success',
            message: 'Account created successfully!',
            user: { id: user.id, name: user.name, email: user.email, profile_picture: user.profile_picture, auth_provider: user.auth_provider }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Server error during registration.' });
    }
});

// --- LOCAL AUTH: Login ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user || user.auth_provider !== 'local') {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        if (!user.password_hash) {
            return res.status(401).json({ error: 'This account uses Google Sign-In. Please log in with Google.' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Issue JWT cookie
        const JWT_SECRET = process.env.JWT_SECRET || 'verifiai_super_secret_dev_key';
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });

        return res.status(200).json({
            status: 'success',
            message: 'Logged in successfully!',
            user: { id: user.id, name: user.name, email: user.email, profile_picture: user.profile_picture, auth_provider: user.auth_provider }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error during login.' });
    }
});

/**
 * POST /api/extract-image-text
 * Vision API endpoint for extracting text from newspaper clippings/images via Gemini or Groq Vision.
 */
app.post('/api/extract-image-text', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'Image content is required.' });
        }

        let mimeType = 'image/jpeg';
        let base64Data = image;
        if (image.startsWith('data:')) {
            const matches = image.match(/^data:(image\/\w+);base64,(.*)$/);
            if (matches) {
                mimeType = matches[1];
                base64Data = matches[2];
            }
        }

        let extractedText = null;
        let sourceUsed = null;

        // 1. Try Gemini Vision if GEMINI_API_KEY is available
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
            try {
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                const imagePart = {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                };

                const prompt = "Extract and transcribe all printed headline and news article text verbatim from this image. Do not include intro or meta explanations. Return ONLY the extracted text.";
                const result = await model.generateContent([prompt, imagePart]);
                const responseText = result.response.text();

                if (responseText && responseText.trim().length > 0) {
                    extractedText = responseText.trim();
                    sourceUsed = 'Gemini AI Vision';
                    console.log('[VISION SUCCESS] Extracted image text via Gemini AI Vision');
                }
            } catch (geminiErr) {
                console.warn('[VISION NOTICE] Gemini Vision unavailable:', geminiErr.message);
            }
        }

        // 2. Fall back cleanly if no AI Vision key configured
        if (!extractedText) {
            console.log('[VISION NOTICE] AI Vision API not configured or skipped. Utilizing client Tesseract OCR.');
        }

        if (extractedText) {
            return res.status(200).json({
                status: 'success',
                text: extractedText,
                source: sourceUsed
            });
        }

        // Fallback response if no Vision API keys configured, triggering client OCR safely
        return res.status(200).json({
            status: 'fallback',
            message: 'AI Vision API not configured. Triggering Tesseract client-side OCR.'
        });

    } catch (error) {
        console.error('Error in /api/extract-image-text:', error.message);
        return res.status(200).json({
            status: 'fallback',
            message: 'Internal error in vision endpoint, falling back to client OCR.'
        });
    }
});

/**
 * MODULE 5: POST /api/check-news
 * Receives news text from frontend, calls Python ML, saves to DB, returns to frontend.
 */
app.post('/api/check-news', authenticateOptional, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'News text is required.' });
        }

        // --- INPUT QUALITY VALIDATION: Detect gibberish / random text ---
        const words = text.trim().split(/\s+/);
        const wordCount = words.length;

        // Must have at least 4 words
        if (wordCount < 4) {
            return res.status(400).json({ 
                error: 'Please enter a meaningful news article or claim (at least 4 words).' 
            });
        }

        // Check for gibberish: count words that look like real English words
        // (contain at least 2 consecutive vowels or common consonant patterns)
        const vowels = /[aeiou]/i;
        const realWordPattern = /^[a-zA-Z]{2,}$/;
        let realWordCount = 0;
        for (const word of words) {
            const cleanWord = word.replace(/[^a-zA-Z]/g, '');
            if (cleanWord.length >= 2 && realWordPattern.test(cleanWord) && vowels.test(cleanWord)) {
                realWordCount++;
            }
        }

        // If less than 40% of words look like real words, reject as gibberish
        const realWordRatio = realWordCount / wordCount;
        if (realWordRatio < 0.4) {
            return res.status(400).json({ 
                error: 'The input appears to be random or gibberish. Please enter a real news article or claim.' 
            });
        }

        // Average word length check: real sentences have avg word length 3-12 chars
        const totalChars = words.join('').replace(/[^a-zA-Z]/g, '').length;
        const avgWordLen = totalChars / wordCount;
        if (avgWordLen < 2 || avgWordLen > 20) {
            return res.status(400).json({ 
                error: 'The input does not appear to be a valid news article. Please enter meaningful text.' 
            });
        }

        // --- MODULE 5: API Response Caching via Prisma ---
        try {
            const cached = await prisma.newsCheck.findFirst({ 
                where: { news_text: text },
                orderBy: { created_at: 'desc' }
            });

            // Serve cache ONLY if the cached row contains a valid Groq AI summary
            const isFallbackSummary = cached && cached.ai_summary && (
                cached.ai_summary.includes('unavailable') || 
                cached.ai_summary.includes('not generated') || 
                cached.ai_summary.includes('Internal Scikit-Learn')
            );

            if (cached && !isFallbackSummary) {
                const user_id = req.user ? req.user.id : null;
                
                const newRow = await prisma.newsCheck.create({
                    data: {
                        news_text: text,
                        prediction: cached.prediction,
                        confidence: cached.confidence,
                        api_verification: cached.api_verification,
                        ai_summary: cached.ai_summary,
                        credibility_score: cached.credibility_score,
                        claim_category: cached.claim_category,
                        user_id
                    }
                });

                // Recalculate quick local manipulation risk
                const clickbaitKeywords = ['shocking', 'secret cure', "they don't want you to know", 'miracle treatment', 'exposed truth', 'you won\'t believe', 'mind-blowing', 'scandal', 'hidden agenda', 'banned'];
                let clickbaitMatched = false;
                const lowerText = text.toLowerCase();
                for (const kw of clickbaitKeywords) { if (lowerText.includes(kw)) { clickbaitMatched = true; break; } }
                
                return res.status(200).json({
                    status: 'success',
                    data: {
                        id: newRow.id, // Pass the NEW row ID back to the frontend
                        text: cached.news_text,
                        prediction: cached.prediction,
                        confidence: cached.confidence,
                        category: cached.claim_category,
                        api_verification: cached.api_verification + " (Cached)",
                        ai_summary: cached.ai_summary,
                        credibility_score: cached.credibility_score,
                        matched_sources: [], // Avoids scraping live internet
                        manipulation_risk: clickbaitMatched ? "HIGH" : "LOW",
                        is_cached: true
                    }
                });
            }
        } catch (dbErr) {
            console.warn('Cache check failed. Falling back to live APIs.', dbErr.message);
        }
        
        // --- MODULE 5: Python ML Flask Service Integration ---
        const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:5001';
        let mlPrediction = null;
        let mlConfidence = null;
        try {
            const mlResponse = await axios.post(`${ML_API_URL}/predict`, { text }, { timeout: 3000 });
            if (mlResponse.data && mlResponse.data.prediction) {
                mlPrediction = mlResponse.data.prediction;
                mlConfidence = mlResponse.data.confidence;
                console.log(`[ML SERVICE SUCCESS] Model Prediction: ${mlPrediction}, Confidence: ${mlConfidence}`);
            }
        } catch (mlErr) {
            console.warn(`[ML SERVICE WARNING] ML service at ${ML_API_URL} skipped or unreachable:`, mlErr.message);
        }

        const groqApiKey = GROQ_API_KEY;
        let factCheckContext = "";

        // 1. Fetch live contextual data from NewsAPI
        let apiVerification = 'Pending';
        let contextText = factCheckContext + "Live internet search results:\n";
        let matchedSources = []; // MODULE 2 array
        let avg_source_score = 0.2; // MODULE 2 calculated score
        const newsApiKey = NEWS_API_KEY;
        
        if (newsApiKey && newsApiKey !== 'your_free_newsapi_key_here') {
            try {
                // --- MODULE 8: Improved Keyword Extraction ---
                // Removing common extremely broad stop-words prevents NewsAPI garbage data return.
                const stopWords = ['the','is','at','which','and','on','a','an','of','to','in','for','with','by','that','this','it','from','as','are','was'];
                const cleanWords = text.replace(/[^\w\s]/gi, '').split(/\s+/)
                    .filter(word => word.length > 2 && !stopWords.includes(word.toLowerCase()));
                const optimalQuery = cleanWords.slice(0, 6).join(' ');
                
                const queryText = encodeURIComponent(optimalQuery || text.substring(0, 50));
                
                // FEATURE A: Domain Whitelisting for high-accuracy tier-1 journalism (English, Hindi, Marathi)
                const safeDomains = 'bbc.com,reuters.com,thehindu.com,indianexpress.com,timesofindia.indiatimes.com,hindustantimes.com,ndtv.com,aajtak.in,jagran.com,bhaskar.com,abplive.com,amarujala.com,lokmat.com,loksatta.com,maharashtratimes.com,esakal.com';
                
                // --- MODULE 8: Limit API Requests ---
                // Note: Restricts payload heavily via &pageSize=5 instead of downloading 100 array items
                const newsResponse = await axios.get(`https://newsapi.org/v2/everything?q=${queryText}&domains=${safeDomains}&sortBy=relevancy&pageSize=5&apiKey=${newsApiKey}`);
                
                const articles = newsResponse.data.articles || [];
                const topArticles = articles.slice(0, 5);
                
                if (topArticles.length === 0) {
                    contextText += "No recent reliable articles found on this topic.\n";
                } else {
                    // --- MODULE 2: Source Credibility Ranking ---
                    const credibilityMap = {
                        'bbc news': 0.95,
                        'reuters': 0.95,
                        'the guardian': 0.90,
                        'cnn': 0.85,
                        'the hindu': 0.90,
                        'the indian express': 0.85,
                        'the times of india': 0.80,
                        'hindustan times': 0.80,
                        'ndtv': 0.80
                    };
                    
                    let total_score = 0;
                    
                    topArticles.forEach((article, index) => {
                        contextText += `Source ${index + 1}: ${article.source.name}\nTitle: ${article.title}\nDescription: ${article.description}\n\n`;
                        
                        // Module 2 logic
                        const sName = article.source.name ? article.source.name.toLowerCase() : '';
                        const sScore = credibilityMap[sName] || 0.40; // 0.40 for unknown
                        total_score += sScore;
                        
                        matchedSources.push({
                            name: article.source.name,
                            score: sScore,
                            description: article.description || "No description provided."
                        });
                    });
                    
                    avg_source_score = total_score / topArticles.length;
                }
                
                const totalResults = newsResponse.data.totalResults || 0;
                
                if (totalResults > 5) {
                    apiVerification = 'High Credibility (Widely Reported)';
                } else if (totalResults > 0) {
                    apiVerification = 'Moderate Credibility (Some Sources Found)';
                } else {
                    apiVerification = 'Low Credibility (No Trusted Sources Found)';
                }
            } catch (apiErr) {
                console.error('External API Request Failed:', apiErr.response?.data || apiErr.message);
                apiVerification = 'Verification Failed (API Limit Reached or Error)';
                contextText += "Error fetching live data. Rely solely on internal knowledge.\n";
            }
        } else {
            apiVerification = 'NewsAPI Key missing in .env - Setup Required';
            contextText += "No live data available (API Key missing).\n";
        }

        // 2. Feed text and live context to Groq AI
        let prediction = "Fake";
        let confidence = 0.5;
        let aiSummary = 'AI Fact-Check not generated. Please configure GROQ_API_KEY in .env.';
        let claim_category = 'Other'; // MODULE 3 Default

        if (groqApiKey && groqApiKey !== 'your_groq_api_key_here') {
            const fallbackModels = [
                "qwen/qwen3.6-27b",
                "groq/compound-mini",
                "openai/gpt-oss-120b"
            ];

            let success = false;
            let lastError = null;

            for (const modelName of fallbackModels) {
                try {
                    const groq = new Groq({ apiKey: groqApiKey });

                    const prompt = `You are a strict, objective, expert fact-checking AI system.
Today's actual date is: ${new Date().toDateString()}. Use this date for temporal context.

User Claim to verify: "${text.substring(0, 500)}"

Scraped Internet Search Snippets (Context):
${contextText}

EVALUATION RULES:
1. FACT-CHECK THE SPECIFIC ASSERTION, NOT JUST THE ENTITY: Just because a real company, person, or institution exists does NOT mean claims about them are true.
2. REQUIRE VERIFIABLE EVIDENCE: If a claim asserts a specific event, state, or outcome that is not supported by verified news sources, official reports, or established facts, classify it as "Fake".
3. POOR GRAMMAR / VAGUE RUMORS / SLANG: Claims with severe grammatical errors, vague assertions, or unsourced rumors must be classified as "Fake" or marked with very low confidence.
4. "Real" vs "Fake" GUIDELINES:
   - "Real": The specific claim is accurate, documented by reputable sources, and supported by factual evidence.
   - "Fake": The claim is false, unverified rumor, misleading, fabricated, or lacks any credible factual evidence.

Respond ONLY with a valid JSON object in strict JSON format:
{
  "prediction": "Real" | "Fake",
  "confidence": 0.00 to 1.00,
  "summary": "Detailed 2-3 sentence explanation evaluating the claim's factual accuracy.",
  "citations": ["Source Name 1", "Source Name 2"],
  "category": "Politics" | "Health" | "Science" | "Technology" | "Economy" | "Entertainment" | "World" | "Education" | "Other"
}`;

                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            { role: 'system', content: 'You are an objective AI fact-checking engine. Always return valid JSON matching requested keys.' },
                            { role: 'user', content: prompt }
                        ],
                        model: modelName,
                        temperature: 0.1,
                        max_tokens: 2048
                    });

                    const responseText = chatCompletion.choices[0]?.message?.content?.trim() || '';

                    // Strip <think> tags from reasoning models and clean markdown blocks
                    let cleaned = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```json/gi, '').replace(/```/g, '').trim();

                    // Multi-step robust JSON extraction and parsing
                    let aiResult = null;

                    try {
                        aiResult = JSON.parse(cleaned);
                    } catch (e1) {
                        const firstBrace = cleaned.indexOf('{');
                        const lastBrace = cleaned.lastIndexOf('}');
                        if (firstBrace !== -1 && lastBrace > firstBrace) {
                            try {
                                aiResult = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
                            } catch (e2) {
                                console.warn(`[AI PARSE NOTICE] Multi-step extraction failed for model ${modelName}`);
                            }
                        }
                    }

                    if (!aiResult) {
                        throw new Error(`Model ${modelName} returned non-JSON response structure`);
                    }

                    prediction = aiResult.prediction || "Fake";
                    confidence = aiResult.confidence || 0.5;
                    let baseSummary = aiResult.summary || "No summary provided.";

                    // --- MODULE 3: Claim Category Extraction ---
                    claim_category = aiResult.category || "Other";

                    // FEATURE B: Source Citations
                    let citationsList = aiResult.citations || [];
                    if (citationsList.length > 0) {
                        aiSummary = baseSummary + "\n\nSources Cited: " + citationsList.join(', ');
                    } else {
                        aiSummary = baseSummary;
                    }

                    // If we reach this point without crashing, the model succeeded!
                    success = true;
                    console.log(`[AI SUCCESS] Verified using Groq model: ${modelName}`);
                    break; // Escape the fallback loop

                } catch (groqError) {
                    lastError = groqError;
                    console.warn(`[AI FALLBACK NOTICE] Groq model ${modelName} failed (${groqError.message}). Trying next active model...`);
                    continue; // Try next model in list
                }
            }

            // If ALL Groq models failed, trigger robust fallback logic using ML Flask prediction if available
            if (!success) {
                console.error("[CRITICAL] All Groq AI models failed verifying the claim.");

                prediction = mlPrediction || "Fake";
                confidence = mlConfidence || 0.50;
                claim_category = "Other";

                if (lastError && (lastError.message.includes('429') || lastError.message.includes('rate_limit'))) {
                    aiSummary = `The AI verification engine reached the Groq API quota limit. Standard ML model prediction: ${prediction} (Confidence: ${Math.round(confidence * 100)}%).`;
                } else if (mlPrediction) {
                    aiSummary = `Internal Scikit-Learn ML Model analyzed the article and classified it as ${prediction} with ${Math.round(confidence * 100)}% confidence. Groq AI detailed analysis was unavailable.`;
                } else {
                    aiSummary = "The AI verification engine encountered a processing error while verifying this claim. Based on preliminary semantic checks, please approach this article with caution.";
                }
            }
        } else if (mlPrediction) {
            // Groq API Key missing in .env, rely on Python ML Service
            prediction = mlPrediction;
            confidence = mlConfidence;
            aiSummary = `Python Scikit-Learn Model Prediction: ${prediction} (${Math.round(confidence * 100)}% confidence). GROQ_API_KEY is not configured for full AI reasoning summaries.`;
        }

        // --- MODULE 1: Credibility Score Engine ---
        // Use our dynamically calculated average source score from Module 2 NewsAPI results
        let source_score = avg_source_score;
        
        // --- MODULE 4: Clickbait Language Detection ---
        const clickbaitKeywords = [
            'shocking', 'secret cure', "they don't want you to know", 
            'miracle treatment', 'exposed truth', 'you won\'t believe', 
            'mind-blowing', 'scandal', 'hidden agenda', 'banned'
        ];
        
        let clickbaitMatched = false;
        const lowerText = text.toLowerCase();
        
        for (const kw of clickbaitKeywords) {
            if (lowerText.includes(kw)) {
                clickbaitMatched = true;
                break;
            }
        }
        
        // If manipulative language is detected, slash the language score. Otherwise, perfect 1.0 score.
        let language_score = clickbaitMatched ? 0.3 : 1.0; 
        let manipulation_risk = clickbaitMatched ? "HIGH" : "Low";
        
        // credibility_score = (ai_confidence * 0.5) + (source_score * 0.3) + (language_score * 0.2)
        let credibility_score = Math.round((confidence * 100 * 0.5) + (source_score * 100 * 0.3) + (language_score * 100 * 0.2));
        
        // Cap score tightly between 0 - 100
        credibility_score = Math.min(100, Math.max(0, credibility_score));

        // 3. Save result into Supabase PostgreSQL Database via Prisma ORM
        const user_id = req.user ? req.user.id : null;
        let recordId = Date.now();
        
        try {
            const newCheck = await prisma.newsCheck.create({
                data: {
                    news_text: text,
                    prediction,
                    confidence,
                    api_verification: apiVerification,
                    ai_summary: aiSummary,
                    credibility_score,
                    claim_category,
                    user_id
                }
            });
            if (newCheck && newCheck.id) recordId = newCheck.id;
        } catch (dbInsertErr) {
            console.warn('[DB WARNING] Failed to persist news check to Supabase database:', dbInsertErr.message);
        }

        // 4. Return the comprehensive result to the frontend
        res.status(200).json({
            status: 'success',
            data: {
                id: recordId,
                text: text,
                prediction: prediction,
                confidence: confidence,
                category: claim_category,
                api_verification: apiVerification,
                ai_summary: aiSummary,
                credibility_score: credibility_score,
                matched_sources: matchedSources,
                manipulation_risk: manipulation_risk
            }
        });


    } catch (error) {
        console.error('Error during /check-news:', error.stack);
        res.status(500).json({ error: 'Internal server error while checking news.' });
    }


});

/**
 * MODULE 6 Extension: GET /api/history
 * Fetches recent news checks from the database to display on the History page.
 * NOW RESTRICTED to logged-in users only.
 */
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const rows = await prisma.newsCheck.findMany({
            where: { user_id: req.user.id },
            orderBy: { created_at: 'desc' },
            take: 50
        });
        
        const total_claims = await prisma.newsCheck.count({ where: { user_id: req.user.id } });
        const fake_news = await prisma.newsCheck.count({ where: { user_id: req.user.id, prediction: 'Fake' } });
        const real_news = await prisma.newsCheck.count({ where: { user_id: req.user.id, prediction: 'Real' } });
        const avgResult = await prisma.newsCheck.aggregate({
            _avg: { credibility_score: true },
            where: { user_id: req.user.id }
        });
        const avgCred = avgResult._avg ? avgResult._avg.credibility_score : 0;
        
        res.status(200).json({
            status: 'success',
            data: rows,
            analytics: {
                total_claims: total_claims || 0,
                fake_news: fake_news || 0,
                real_news: real_news || 0,
                avg_credibility: avgCred ? Math.round(avgCred) : 0
            }
        });
    } catch (error) {
        console.warn('DB warning fetching history:', error.message);
        res.status(200).json({ 
            status: 'success', 
            data: [], 
            analytics: { total_claims: 0, fake_news: 0, real_news: 0, avg_credibility: 0 } 
        });
    }
});

app.post('/api/history/guest', async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(200).json({ status: 'success', data: [], analytics: null });
        }

        const validIds = ids.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
        if (validIds.length === 0) return res.status(200).json({ status: 'success', data: [], analytics: null });

        const rows = await prisma.newsCheck.findMany({
            where: { id: { in: validIds } },
            orderBy: { created_at: 'desc' },
            take: 10
        });

        const total_claims = await prisma.newsCheck.count({ where: { id: { in: validIds } } });
        const fake_news = await prisma.newsCheck.count({ where: { id: { in: validIds }, prediction: 'Fake' } });
        const real_news = await prisma.newsCheck.count({ where: { id: { in: validIds }, prediction: 'Real' } });
        const avgResult = await prisma.newsCheck.aggregate({
            _avg: { credibility_score: true },
            where: { id: { in: validIds } }
        });
        const avgCred = avgResult._avg ? avgResult._avg.credibility_score : 0;

        res.status(200).json({
            status: 'success',
            data: rows,
            analytics: {
                total_claims: total_claims || 0,
                fake_news: fake_news || 0,
                real_news: real_news || 0,
                avg_credibility: avgCred ? Math.round(avgCred) : 0
            }
        });
    } catch (error) {
        console.warn('DB warning fetching guest history:', error.message);
        res.status(200).json({ 
            status: 'success', 
            data: [], 
            analytics: { total_claims: 0, fake_news: 0, real_news: 0, avg_credibility: 0 } 
        });
    }
});

// --- MODULE 8: Proper Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.stack);
    res.status(500).json({ error: 'Critical server error occurred.' });
});

// SPA Fallback Route for React Single Page Application
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) return next();
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
        if (err) {
            // Fallback to legacy index.html if dist does not exist yet
            res.sendFile(path.join(__dirname, '../frontend/index.html'), (legacyErr) => {
                if (legacyErr) res.status(404).send('Not Found');
            });
        }
    });
});

// Start server locally if run directly
if (require.main === module) {
    app.listen(PORT, async () => {
        console.log(`Express server running on http://localhost:${PORT}`);
        try {
            await prisma.$connect();
            console.log('[PRISMA SUCCESS] Connected to Supabase PostgreSQL database.');
        } catch (err) {
            console.warn('[PRISMA WARN] Could not connect to Supabase PostgreSQL:', err.message);
        }
    });
}

module.exports = app;

// --- MODULE 9: Automated Database Cleanup (Cron via Prisma) ---
cron.schedule('0 0 * * *', async () => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const deleted = await prisma.newsCheck.deleteMany({
            where: {
                user_id: null,
                created_at: { lt: sevenDaysAgo }
            }
        });
        if (deleted.count > 0) {
            console.log(`[Cron Database Cleanup]: Deleted ${deleted.count} old guest cache rows.`);
        }
    } catch (error) {
        console.error('[Cron Database Cleanup Error]:', error.message);
    }
});
