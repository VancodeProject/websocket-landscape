INSERT INTO users(username, email, password) VALUES 
(
    'thomas',
    'test.thomas@test',
    'cc03e747a6afbbcbf8be7668acfebee5'
),
(
    'alex',
    'test.alex@test',
    'cc03e747a6afbbcbf8be7668acfebee5'
);

INSERT INTO languages(name) VALUES
(
    'C'
),
(
    'C++'
),
(
    'Java'
),
(
    'Python'
),
(
    'Golang'
),
(
    'Dart'
);

INSERT INTO rooms(master_id, title, filename, language_id, timer, date_creation, date_last_change, max_users, slang) VALUES
(
    2,
    'Je suis bg',
    'je_suis_bg.csv',
    2,
    033939,
    '2020-11-19 00:00:00',
    '2020-11-19 03:00:00',
    25,
    'HIff67FLkdjoi0zdksd'
),
(
    2,
    'Programmation Dart',
    'programmation_dart.csv',
    6,
    013939,
    '2020-11-19 04:30:00',
    '2020-11-20 07:00:00',
    35,
    'JDLçDJdOD9D8YI7DGUI'
),
(
    1,
    'Programmation Dart',
    'programmation_dart.csv',
    6,
    013939,
    '2020-11-19 04:30:00',
    '2020-11-20 07:00:00',
    30,
    'HJDH8HA09FHU9ZUDl9D'
);