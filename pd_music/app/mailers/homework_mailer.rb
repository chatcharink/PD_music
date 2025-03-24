class HomeworkMailer < ApplicationMailer
    def new_assignment user, homework_name, deadline_date
        @user = user
        @homework = [homework_name, deadline_date]
        if homework_name.present?
            mail(to: @user.email, subject: "New assignment homework")
        end
    end

    def change_status user, subject, message
        @user = user
        @message = message
        mail(to: @user.email, subject: "Do homework successfully")
    end
end
