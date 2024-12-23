class Subject < ApplicationRecord
    def self.insert_subject form, session
        subject = Subject.create(subject_name: form["subject"], description: form["description"], subject_type: "homework", class_periods: form["class_period"], status: "active", created_by: session["current_user"]["id"])
        subject
    end

    def self.insert_subject_participation form, session
        subject = Subject.create(subject_name: form["subject"], description: form["description"], subject_type: "participation", class_periods: form["class_period"], status: "active", created_by: session["current_user"]["id"])
        subject
    end

    def self.update_subject form, session
        subject = Subject.update(form["subject_id"], subject_name: form["subject"], description: form["description"], class_periods: form["class_period"])
        subject
    end
end
