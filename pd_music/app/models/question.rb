class Question < ApplicationRecord
    has_one_attached :question_media
    has_one_attached :answer
    has_one_attached :reveal
end
