class Notification < ApplicationRecord
    def self.insert_notification form, current_user_id
        comment = Notification.create(subject: form["subject"], message: form["comment"], status: 0, send_by: current_user_id, user_id: form["comment_to"], notification_type: "behaviour")
        comment
    end
end
