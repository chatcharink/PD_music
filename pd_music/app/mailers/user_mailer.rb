class UserMailer < ApplicationMailer
    def reset_password user, token
        @user = user
        @token = token
        mail(to: @user.email, subject: "Reset password")
    end

    def approved user
        @user = user
        mail(to: user.email, subject: "Activate you account")
    end
end
