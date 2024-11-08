class CommentBehaviourMailer < ApplicationMailer
    def comment user, comment
        @user = user
        @comment = comment
        mail(to: @user.email, subject: 'Review behaviour in classroom')
    end
end
