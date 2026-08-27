-- ============================================================
-- 방명록 (guestbook) — UI에 맞춘 스키마
-- MySQL 8.0 / message_board
--
-- UI 필드 → 컬럼 대응
--   author   → users.display_name      (카드에 보이는 이름)
--   handle   → users.username          (@아이디, 로그인 ID)
--   color    → users.color             (아바타 단색)
--   verified → users.is_owner          ("주인장" 배지)
--   paper    → messages.paper          (편지지 7종)
--   no       → messages.msgid          (No.1284)
--   likes    → message_likes COUNT
--   liked    → message_likes 에 내 행 존재 여부
--   saved    → message_saves 에 내 행 존재 여부
--   comments → comments
-- ============================================================

-- ── users ───────────────────────────────────────────────────
-- password: MD5 폭(32)이던 것을 bcrypt 해시(60자)가 들어가도록 255로 확장
ALTER TABLE `users`
  MODIFY COLUMN `password` VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  ADD COLUMN `display_name` VARCHAR(50)  NOT NULL                       AFTER `username`,
  ADD COLUMN `color`        CHAR(7)      NOT NULL DEFAULT '#6a7889'     AFTER `display_name`,
  ADD COLUMN `bio`          VARCHAR(200) NOT NULL DEFAULT '아직 소개가 없어요' AFTER `color`,
  ADD COLUMN `is_owner`     TINYINT(1)   NOT NULL DEFAULT 0             AFTER `bio`;

-- ── messages ────────────────────────────────────────────────
ALTER TABLE `messages`
  ADD COLUMN `paper` ENUM('plain','hanji','celadon','dawn','plum','moss','ink')
    NOT NULL DEFAULT 'plain' AFTER `content`,
  ADD INDEX `idx_messages_created_at` (`created_at` DESC);

-- ── comments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `comments` (
  `commentid`  INT          NOT NULL AUTO_INCREMENT,
  `msgid`      INT          NOT NULL,
  `userid`     INT          NOT NULL,
  `content`    VARCHAR(500) NOT NULL,
  `created_at` TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`commentid`),
  KEY `idx_comments_msgid` (`msgid`, `created_at`),
  KEY `idx_comments_userid` (`userid`),
  CONSTRAINT `comments_msgid_fk`  FOREIGN KEY (`msgid`)  REFERENCES `messages` (`msgid`) ON DELETE CASCADE,
  CONSTRAINT `comments_userid_fk` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── message_likes (공감) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `message_likes` (
  `msgid`      INT       NOT NULL,
  `userid`     INT       NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`msgid`, `userid`),
  KEY `idx_message_likes_userid` (`userid`),
  CONSTRAINT `message_likes_msgid_fk`  FOREIGN KEY (`msgid`)  REFERENCES `messages` (`msgid`) ON DELETE CASCADE,
  CONSTRAINT `message_likes_userid_fk` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── message_saves (보관) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `message_saves` (
  `msgid`      INT       NOT NULL,
  `userid`     INT       NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`msgid`, `userid`),
  KEY `idx_message_saves_userid` (`userid`),
  CONSTRAINT `message_saves_msgid_fk`  FOREIGN KEY (`msgid`)  REFERENCES `messages` (`msgid`) ON DELETE CASCADE,
  CONSTRAINT `message_saves_userid_fk` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
