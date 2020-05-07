CREATE TABLE votes (
    user_id int NOT NULL,
    review_id int NOT NULL,
    up bool NOT NULL,
    PRIMARY KEY(user_id, review_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);