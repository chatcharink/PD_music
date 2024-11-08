class HomeworkUserMapping < ApplicationRecord
    def self.get_hw_user_mapping session
        hw_user_mapping = HomeworkUserMapping.select("homeworks.*, homework_user_mappings.*, users.id as student_id, users.firstname, users.lastname, users.role")
        hw_user_mapping = hw_user_mapping.where("homeworks.status = ?", "active")
        hw_user_mapping = hw_user_mapping.joins("left join homeworks on homeworks.id = homework_user_mappings.homework_id")
        hw_user_mapping = hw_user_mapping.joins("left join users on users.id = homework_user_mappings.user_id")
        return hw_user_mapping
    end
end
