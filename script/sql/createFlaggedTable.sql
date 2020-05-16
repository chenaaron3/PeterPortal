CREATE TABLE flagged (
    flag_id int NOT NULL AUTO_INCREMENT,
    user_id int,
    review_id int NOT NULL,
    reason varchar(255) NOT NULL,
    comments text NOT NULL,
    reported_at date NOT NULL,
    fulfilled_at date DEFAULT NULL,
    fulfill_by varchar(255) DEFAULT NULL,
    flag_status ENUM ('pending', 'agreed', 'disagreed') NOT NULL,
    PRIMARY KEY(flag_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (review_id) REFERENCES reviews(id)
);