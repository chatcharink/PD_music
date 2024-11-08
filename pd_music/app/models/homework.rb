class Homework < ApplicationRecord
    def self.insert_homework form_homework
        status = form_homework["lock_homework"] == "unlock" ? "active" : "inactive" 
        homework = Homework.create(
            task_name: form_homework["name"],
            category_id: form_homework["category_id"],
            homework_type_id: form_homework["homework_type"],
            status: status,
            estimate_date: form_homework["estimate_date"],
            full_score: form_homework["full_score"],
            subject_id: form_homework["subject_id"],
            is_default: form_homework["is_default"].to_i,
            priority: form_homework["priority"]
        )
        homework
    end
end
