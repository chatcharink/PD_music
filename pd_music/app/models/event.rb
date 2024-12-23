class Event < ApplicationRecord
    def self.insert_event_participation form, session
        subject = Event.create(event_name: form["event"], description: form["description"], event_date: form["event_date"], status: "active", created_by: session["current_user"]["id"])
        subject
    end
end
