CREATE TABLE votes (
    email varchar(255) NOT NULL,
    review_id int NOT NULL,
    up bool NOT NULL,
    PRIMARY KEY(email, review_id),
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);