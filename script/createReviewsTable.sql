CREATE TABLE reviews (
    id int NOT NULL AUTO_INCREMENT,
    body text NOT NULL,
    rating int NOT NULL,
    difficulty int NOT NULL,
    user_id varchar(255) NOT NULL,
    course_id varchar(255) NOT NULL,
    prof_id	varchar(255) NOT NULL,
    submitted_at date NOT NULL,
    grade varchar(255) NOT NULL,
    for_credit boolean DEFAULT false,
    up_votes int DEFAULT 0,
    down_votes int DEFAULT 0,
    PRIMARY KEY(id)
);