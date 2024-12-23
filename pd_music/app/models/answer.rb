class Answer < ApplicationRecord
    has_one_attached :upload_answer
    has_one_attached :secondary_upload_answer

    def self.insert_answer session, params
        answer = Answer.create(homework_id: params["id"],
            question_no: (params["question_no"].to_i)-1,
            user_id: session["current_user"]["id"],
            current_score: params["form_answer"]["your_score"],
            current_progress: params["progress"],
            current_reveal_time: params["reveal_time"],
            answer: params["form_answer"]["your_answer"],
            upload_answer: params["form_answer"]["answer_media"],
            secondary_upload_answer: params["form_answer"]["answer_media2"]
        )
        answer
    end

    def self.update_answer session, params
        if params["form_answer"]["record_audio"] == "true"
            answer = Answer.update(params["form_answer"]["answer_id"],
                homework_id: params["id"],
                question_no: (params["question_no"].to_i)-1,
                user_id: session["current_user"]["id"],
                current_score: params["form_answer"]["your_score"],
                current_progress: params["progress"],
                current_reveal_time: params["reveal_time"],
                answer: params["form_answer"]["your_answer"]
            )
        else
            answer = Answer.update(params["form_answer"]["answer_id"],
                homework_id: params["id"],
                question_no: (params["question_no"].to_i)-1,
                user_id: session["current_user"]["id"],
                current_score: params["form_answer"]["your_score"],
                current_progress: params["progress"],
                current_reveal_time: params["reveal_time"],
                answer: params["form_answer"]["your_answer"],
                upload_answer: params["form_answer"]["answer_media"],
                secondary_upload_answer: params["form_answer"]["answer_media2"]
            )
        end
    end

    def self.insert_audio params
        answer = Answer.create(upload_answer: params["record_audio"])
        answer
    end

    def self.update_audio params
        answer = params["times"] == "1" ? Answer.update(params["answer_id"], upload_answer: params["record_audio"]) : Answer.update(params["answer_id"], secondary_upload_answer: params["record_audio"])
        answer
    end

end
