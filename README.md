# softengi-test-students-task
Test task for Java Script Junior Developer position


 Создала проект Ковалевская Светлана.
Тестовое задание на позицию Java Script Junior Developer.
Проект для тестирования знаний по математике.

1) Создать таблицы.

CREATE table application_settings(key VARCHAR(20) not null PRIMARY key, value JSON not null);
CREATE table students(id BIGSERIAL PRIMARY KEY, name VARCHAR(50) not null);
CREATE table student_tests(id BIGSERIAL PRIMARY KEY, student_id bigint REFERENCES students(id), date date, addition boolean, subtraction boolean, multiplication boolean, division boolean, number_of_questions integer);
CREATE table test_tasks(id BIGSERIAL PRIMARY KEY, test_id bigint REFERENCES student_tests(id), questions VARCHAR(50), correct_answer bigint, student_answer bigint);


2) Для получения отчетов:

Отчет 1. Показать учеников, прошедших тестирование за указанный период (имя, дата, типы решённых примеров),
кол-во правильно и неправильно решённых примеров, результат = % правильных ответов).

 SELECT *,
    (SELECT count(*) FROM test_tasks WHERE test_id=student_tests.id AND correct_answer=student_answer) AS correct_answers_count,
    (SELECT count(*) FROM test_tasks WHERE test_id=student_tests.id AND correct_answer<>student_answer) AS incorrect_answers_count

    FROM students
    JOIN student_tests ON students.id = student_tests.student_id
    WHERE finished = true ORDER BY date DESC, name;


Отчет 2. Показать учеников, ни разу за период не проходивших тестирование.

SELECT * FROM students LEFT JOIN student_tests ON students.id = student_tests.student_id WHERE finished is null;


Отчет 3. Ученики, проходившие тестирование не менее трёх раз за указанный период, результат которых не превысил 50%.

 SELECT name FROM (SELECT *,
        ((SELECT count(*) FROM test_tasks WHERE test_id=student_tests.id AND correct_answer=student_answer) * 100 / number_of_questions) AS success_percent
        FROM students LEFT JOIN student_tests ON students.id = student_tests.student_id WHERE finished is true )
        AS bad_results WHERE success_percent < 50 GROUP BY name HAVING count(name) > 2;