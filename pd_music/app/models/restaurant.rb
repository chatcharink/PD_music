class Restaurant < ApplicationRecord
    has_one_attached :restaurant_picture do |attachable|
        attachable.variant :thumb, resize_to_limit: [500, 265]
    end

    def self.insert_data form
        restaurant = Restaurant.create(
                        restaurant_name: form["restaurant"],
                        restaurant_picture: form["restaurant_pic"],
                        status: form["status"],
                        telephone_no: form["telephone"],
                        line_id: form["line"]
        )
        restaurant
    end

    def self.update_data form
        if form["restaurant_pic"].blank?
            restaurant = Restaurant.update(form["update_id"],
                restaurant_name: form["restaurant"],
                status: form["status"],
                telephone_no: form["telephone"],
                line_id: form["line"]
            )
        else
            restaurant = Restaurant.update(form["update_id"],
                restaurant_name: form["restaurant"],
                restaurant_picture: form["restaurant_pic"],
                status: form["status"],
                telephone_no: form["telephone"],
                line_id: form["line"]
            )
        end
        restaurant
    end
end
