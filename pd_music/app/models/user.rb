class User < ApplicationRecord
    has_one_attached :profile_pic do |attachable|
        attachable.variant :thumb, resize_to_limit: [200, 200]
    end

    def self.signup form
        user = User.create(
            username: form["username"], 
            password: form["password"], 
            salt_password: form["salt_password"],
            firstname: form["firstname"],
            lastname: form["lastname"],
            date_of_birth: form["dob"],
            age: form["age"],
            study_class: form["study_year"],
            other_study: form["others_study_year"],
            musical_instrument_id: form["musical_instrument"],
            others_musical_instrument: form["others_musical_instrument"],
            room: form["room"],
            student_no: form["student_no"],
            status: "inactive",
            email: form["email"],
            phone_number: form["phone_number"],
            parent_name: form["parent_firstname"],
            parent_lastname: form["parent_lastname"],
            parent_phoneno: form["parent_phone_number"],
            relation: form["parent_relation"]
        )
        user
    end

    def self.update_password id, salt_password, password
        user = User.update(id, salt_password: salt_password, password: password)
        user
    end

    def self.image_as_thumbnail
        profile_pic.variant(resize_to_limit: [200,200]).processed
    end

    def self.insert_user form, password, salt_password
        user = User.create(username: form["username"],
            password: password,
            salt_password: salt_password,
            firstname: form["firstname"],
            lastname: form["lastname"],
            date_of_birth: form["dob"],
            age: form["age"],
            study_class: form["study_year"],
            other_study: form["other_study"],
            room: form["room"],
            student_no: form["student_no"],
            musical_instrument_id: form["musical_instrument"],
            others_musical_instrument: form["others_musical_instrument"],
            role: form["role"],
            status: form["status"],
            email: form["email"],
            phone_number: form["phone_number"],
            parent_name: form["parent_firstname"],
            parent_lastname: form["parent_lastname"],
            parent_phoneno: form["parent_telephone"],
            first_login: 0,
        )
    end

    def self.update_profile id, form
        user = User.update(id, 
            firstname: form["firstname"],
            lastname: form["lastname"],
            date_of_birth: form["dob"],
            age: form["age"],
            study_class: form["study_year"],
            other_study: form["other_study"],
            room: form["room"],
            student_no: form["student_no"],
            musical_instrument_id: form["musical_instrument"],
            others_musical_instrument: form["others_musical_instrument"],
            role: form["role"],
            status: form["status"],
            email: form["email"],
            phone_number: form["phone_number"],
            parent_name: form["parent_firstname"],
            parent_lastname: form["parent_lastname"],
            parent_phoneno: form["parent_telephone"],
        )
        if form["profile_pic"].present?
            user = User.update(id, profile_pic: form["profile_pic"])
        end
        user
    end
end
