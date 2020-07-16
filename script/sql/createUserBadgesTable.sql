CREATE TABLE users_badges (
	user_id int NOT NULL,
    badge_id int NOT NULL,
    PRIMARY KEY(user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(badge_id) ON DELETE CASCADE
); 
