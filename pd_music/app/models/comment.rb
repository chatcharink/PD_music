class Comment < ApplicationRecord
    def self.get_comment_of_classroom student_id
        comment = Comment.select("comments.*, users.firstname, users.lastname, users.id as student_id")
        comment = comment.joins("left join users on users.id = comments.student_id")
        comment = comment.where(student_id: student_id, comment_type: "classroom").order(rating: :ASC)
        comment
    end

    def self.insert_comment form, current_user_id
        comment = Comment.create(subject: form["subject"], comment: form["comment"], rating: form["rating"], comment_by: current_user_id, student_id: form["comment_to"], comment_type: "classroom")
        comment
    end
end
