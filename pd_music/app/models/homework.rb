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
            priority: form_homework["priority"],
            tag_id: form_homework["tag_id"]
        )
        homework
    end

    def self.update_homework form_homework
        status = form_homework["lock_homework"] == "unlock" ? "active" : "inactive" 
        homework = Homework.update( form_homework["homework_id"],
            task_name: form_homework["name"],
            category_id: form_homework["category_id"],
            homework_type_id: form_homework["homework_type"],
            status: status,
            estimate_date: form_homework["estimate_date"],
            full_score: form_homework["full_score"],
            subject_id: form_homework["subject_id"],
            is_default: form_homework["is_default"].to_i,
            priority: form_homework["priority"],
            tag_id: form_homework["tag_id"]
        )
        homework
    end

    def self.update_question_chord id, question, media, image_thumbnail, score, is_update_question_media, chords, correct_answer
        if is_update_question_media == "true"
            Question.update(id,
                question: question,
                question_media: media,
                image_thumbnail: image_thumbnail,
                score: score,
                chords: chords,
                correct_answer: correct_answer
            )
        else
            Question.update(id,
                question: question,
                image_thumbnail: image_thumbnail,
                score: score,
                chords: chords,
                correct_answer: correct_answer
            )
        end
    end

    def self.update_question(id, question, image_thumbnail, score, correct_answer, answer_value)
        answer_key = answer_value["media"].class == ActionDispatch::Http::UploadedFile ? "answer" : "answer_text"
        if answer_value["update_answer_media"] == "true"
            Question.update(id,
                question: question,
                answer_key.to_sym => answer_value["media"],
                correct_answer: correct_answer,
                image_thumbnail: image_thumbnail,
                score: score,
                answer_image_thumbnail: answer_value["answer_image_thumbnail"]
            )
        else
            Question.update(id,
                question: question,
                correct_answer: correct_answer,
                image_thumbnail: image_thumbnail,
                score: score,
                answer_image_thumbnail: answer_value["answer_image_thumbnail"]
            )
        end
    end

    def self.update_question_with_new_media(id, question, media, image_thumbnail, score, correct_answer, answer_value)
        answer_key = answer_value["media"].class == ActionDispatch::Http::UploadedFile ? "answer" : "answer_text"
        if answer_value["update_answer_media"]
            Question.update(id,
                question: question,
                question_media: media,
                answer_key.to_sym => answer_value["media"],
                correct_answer: correct_answer,
                image_thumbnail: image_thumbnail,
                score: score,
                answer_image_thumbnail: answer_value["answer_image_thumbnail"]
            )
        else
            Question.update(id,
                question: question,
                question_media: media,
                correct_answer: correct_answer,
                image_thumbnail: image_thumbnail,
                score: score,
                answer_image_thumbnail: answer_value["answer_image_thumbnail"]
            )
        end
    end

    def self.update_question_upload(id, question, media, image_thumbnail, score, is_update_question_media, answer_option, reveal)
        if is_update_question_media == "true"
            if reveal["update_reveal"] == "true"
                Question.update(id,
                    question: question,
                    question_media: media,
                    image_thumbnail: image_thumbnail,
                    option: answer_option,
                    reveal: reveal["reveal"],
                    answer_image_thumbnail: reveal["reveal_image_thumbnail"],
                    score: score,
                    correct_answer: nil
                )
            else
                Question.update(id,
                    question: question,
                    question_media: media,
                    image_thumbnail: image_thumbnail,
                    option: answer_option,
                    answer_image_thumbnail: reveal["reveal_image_thumbnail"],
                    score: score,
                    correct_answer: nil
                )
            end
        else
            if reveal["update_reveal"] == "true"
                Question.update(id,
                    question: question,
                    image_thumbnail: image_thumbnail,
                    option: answer_option,
                    reveal: reveal,
                    answer_image_thumbnail: reveal["reveal_image_thumbnail"],
                    score: score,
                    correct_answer: nil
                )
            else
                Question.update(id,
                    question: question,
                    image_thumbnail: image_thumbnail,
                    option: answer_option,
                    answer_image_thumbnail: reveal["reveal_image_thumbnail"],
                    score: score,
                    correct_answer: nil
                )
            end
        end
    end

    def self.update_question_not_reveal(id, question, media, image_thumbnail, score, is_update__question_media, answer_option)
        if is_update__question_media == "true"
            Question.update(id,
                question: question,
                question_media: media,
                image_thumbnail: image_thumbnail,
                option: answer_option,
                reveal: nil,
                answer_image_thumbnail: nil,
                score: score,
                correct_answer: nil
            )
        else
            Question.update(id,
                question: question,
                image_thumbnail: image_thumbnail,
                option: answer_option,
                reveal: nil,
                answer_image_thumbnail: nil,
                score: score,
                correct_answer: nil
            )
        end
    end

end
