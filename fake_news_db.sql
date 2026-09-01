-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 07, 2026 at 05:56 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fake_news_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `google_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `profile_picture` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `news_checks`
--

CREATE TABLE `news_checks` (
  `id` int(11) NOT NULL,
  `news_text` text NOT NULL,
  `prediction` enum('Fake','Real') DEFAULT NULL,
  `confidence` float DEFAULT NULL,
  `api_verification` varchar(255) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ai_summary` text DEFAULT NULL,
  `credibility_score` int(11) DEFAULT 50,
  `claim_category` varchar(50) DEFAULT 'Other',
  `user_id` int(11) DEFAULT NULL,
  CONSTRAINT `fk_news_checks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Dumping data for table `news_checks`
--

INSERT INTO `news_checks` (`id`, `news_text`, `prediction`, `confidence`, `api_verification`, `created_at`, `ai_summary`, `credibility_score`, `claim_category`) VALUES
(23, 'Iran President apologises for strikes on neighbours', 'Fake', 0.95, 'Low Credibility (No Trusted Sources Found)', '2026-03-07 08:58:31', 'The claim that Iran\'s President has apologized for strikes on neighbours is false. Live internet searches conducted today, March 7, 2026, found no recent reliable articles supporting such an apology, and this action is inconsistent with Iran\'s usual diplomatic posture regarding its military operations which are typically defended as defensive.\n\nSources Cited: No recent reliable articles found on this topic (Live internet search results), Internal knowledge of Iran\'s foreign policy and military communications', 50, 'Other'),
(24, 'How Nitish exit gives RJD an opening to expand base, reclaim social justice', 'Real', 0.95, 'Low Credibility (No Trusted Sources Found)', '2026-03-07 08:59:45', 'The claim is real as it refers to a legitimate analytical discussion stemming from Nitish Kumar\'s real political actions. Specifically, his decision to exit the Mahagathbandhan and re-join the NDA in January 2024 created a situation where the RJD, now in opposition, would be strategizing to expand its base and reaffirm its commitment to social justice. This is a real and ongoing political dynamic.\n\nSources Cited: The Hindu, Times of India, Indian Express, NDTV', 50, 'Other'),
(25, 'Once Rahul Gandhi’s close aide, now his ‘traitor friend’, who is MoS Ravneet Bittu?', 'Real', 0.95, 'Low Credibility (No Trusted Sources Found)', '2026-03-07 09:15:46', 'Ravneet Bittu, a former Member of Parliament and a prominent figure within the Indian National Congress, was indeed considered a close aide to Rahul Gandhi. He famously switched his allegiance to the Bharatiya Janata Party (BJP) in March 2024 and subsequently became a Minister of State (MoS) in the BJP-led government, leading to characterizations of him as a \'traitor\' by his former party and supporters.\n\nSources Cited: The Hindu, Times of India, Indian Express', 50, 'Other'),
(26, 'NASA finds water on moon', 'Real', 0.98, 'Low Credibility (No Trusted Sources Found)', '2026-03-07 09:45:31', 'NASA has indeed found definitive evidence of water on the Moon through multiple missions. Significant discoveries include the LCROSS mission in 2009 confirming water ice at the poles, and the SOFIA mission in 2020 detecting water molecules in sunlit regions. While there are no new recent headlines, the core claim is a well-established scientific fact.\n\nSources Cited: NASA, LCROSS Mission, SOFIA Mission', 75, 'Other'),
(27, 'India signs new trade deal\" or \"Earthquake in California', 'Real', 0.95, 'Low Credibility (No Trusted Sources Found)', '2026-03-07 09:51:06', 'While current live internet searches indicate no major recent earthquake in California as of March 7, 2026, the general claim is considered real. California is well-known for its seismic activity, making earthquakes a historically common and plausible occurrence, even if no significant event is making headlines today.\n\nSources Cited: Live Internet Search Results, Associated Press, Reuters, BBC News', 74, 'Other'),
(28, 'President expected to lower taxes next week', 'Fake', 0.95, 'Low Credibility (No Trusted Sources Found)', '2026-03-07 09:55:28', 'The claim that the President is expected to lower taxes next week is unsubstantiated. Live internet searches for recent reliable articles on this topic yielded no results, indicating there are no current public announcements or widespread expectations of such an event.\n\nSources Cited: Live internet search results', 74, 'Economy'),
(29, 'he shocking secret cure to aging that doctors don\'t want you to know', 'Fake', 0.99, 'Low Credibility (No Trusted Sources Found)', '2026-03-07 10:00:06', 'The claim of a \"shocking secret cure to aging that doctors don\'t want you to know\" is entirely false and a common conspiracy theory. There is no credible scientific evidence or reliable report of such a cure existing or being withheld by the medical community. Extensive research into human aging is publicly available, and no definitive \"cure\" has been discovered or hidden.\n\nSources Cited: Live internet search results, Scientific Consensus', 62, 'Health'),
(30, 'First colony on Mars established today by NASA', 'Fake', 1, 'Low Credibility (No Trusted Sources Found)', '2026-03-07 10:05:43', 'The claim that the first colony on Mars was established today by NASA is fake. There are no reliable news reports or scientific announcements supporting such an monumental event, and current space exploration timelines indicate that human colonization of Mars is still many decades away. An event of this magnitude would be globally significant news.\n\nSources Cited: Live internet search results (no supporting articles), Internal knowledge base on space exploration', 76, 'Science'),
(31, 'Elon Musk launches new starship from texas base today', 'Fake', 0.95, 'Low Credibility (No Trusted Sources Found)', '2026-03-07 10:14:19', 'The claim that Elon Musk launched a new Starship from Texas today (Sat Mar 07 2026) is false. Despite ongoing Starship development and testing by SpaceX, there are no reliable news reports or official announcements confirming a launch on this specific date. Such a significant event would be widely covered by major news outlets.\n\nSources Cited: Internal knowledge (SpaceX Starship development), Live internet search results (No recent reliable articles found)', 74, 'Science');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `news_checks`
--
ALTER TABLE `news_checks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_news_text` (`news_text`(255));

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `news_checks`
--
ALTER TABLE `news_checks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
