import os
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Ensure NLTK resources are downloaded
try:
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    nltk.download('stopwords', quiet=True)
except Exception as e:
    print(f"Warning: Could not download NLTK data right now: {e}")


class FakeNewsModelBuilder:
    def __init__(self, dataset_path, model_save_path, vectorizer_save_path):
        self.dataset_path = dataset_path
        self.model_save_path = model_save_path
        self.vectorizer_save_path = vectorizer_save_path
        self.vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2), sublinear_tf=True)
        self.model = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
        
    def load_data(self):
        """Load dataset from CSV. Expecting columns: 'text', 'label'"""
        print(f"Loading dataset from {self.dataset_path}...")
        try:
            df = pd.read_csv(self.dataset_path)
            if 'text' not in df.columns or 'label' not in df.columns:
                raise ValueError("Dataset must contain 'text' and 'label' columns.")
            # Drop missing values
            df = df.dropna(subset=['text', 'label'])
            print(f"Dataset loaded. Total shape: {df.shape}")
            return df
        except Exception as e:
            print(f"Error loading data: {e}")
            return None

    def preprocess_text(self, text):
        """Tokenization, Lowercasing, Stopword Removal"""
        if not isinstance(text, str):
            return ""
        
        # 1. Lowercase
        text = text.lower()
        
        # 2. Tokenization
        tokens = word_tokenize(text)
        
        # 3. Stopword removal and purely alphabetic characters
        stop_words = set(stopwords.words('english'))
        cleaned_tokens = [word for word in tokens if word.isalpha() and word not in stop_words]
        
        return " ".join(cleaned_tokens)

    def train_and_save(self):
        # Load
        df = self.load_data()
        if df is None:
            return
            
        # Preprocess
        print("Preprocessing text data...")
        
        X = df['text'].apply(self.preprocess_text)
        y = df['label']
        
        # Split Data
        print("Splitting data into training and testing sets...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Feature Extraction (TF-IDF)
        print("Extracting features (TF-IDF Vectorization)...")
        X_train_tfidf = self.vectorizer.fit_transform(X_train)
        X_test_tfidf = self.vectorizer.transform(X_test)
        
        # Train Model
        print("Training Logistic Regression Model...")
        self.model.fit(X_train_tfidf, y_train)
        
        # Evaluate
        print("Evaluating Model...")
        y_pred = self.model.predict(X_test_tfidf)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"\nModel Accuracy: {accuracy * 100:.2f}%\n")
        print("Classification Report:")
        print(classification_report(y_test, y_pred))
        
        # Save Model and Vectorizer
        print("Saving Model and Vectorizer...")
        os.makedirs(os.path.dirname(self.model_save_path), exist_ok=True)
        joblib.dump(self.model, self.model_save_path)
        joblib.dump(self.vectorizer, self.vectorizer_save_path)
        print(f"Model saved to: {self.model_save_path}")
        print(f"Vectorizer saved to: {self.vectorizer_save_path}")
        print("Training pipeline completed successfully!")

if __name__ == "__main__":
    # Determine base dir dynamically
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'fake_news_dataset.csv')
    if not os.path.exists(DATASET_PATH):
        DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'sample_news.csv')
    
    # We save models into a 'models' folder
    MODELS_DIR = os.path.join(BASE_DIR, 'models')
    MODEL_PATH = os.path.join(MODELS_DIR, 'model.pkl')
    VECTORIZER_PATH = os.path.join(MODELS_DIR, 'vectorizer.pkl')
    
    builder = FakeNewsModelBuilder(DATASET_PATH, MODEL_PATH, VECTORIZER_PATH)
    builder.train_and_save()

