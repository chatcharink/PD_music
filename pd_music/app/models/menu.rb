class Menu < ApplicationRecord
    has_one_attached :menu_picture do |attachable|
        attachable.variant :thumb, resize_to_limit: [200, 200]
    end

    def self.insert_data form, option_menu
        menu = Menu.create(menu_name: form["menu"],
                        description: form["description"],
                        restaurant_id: form["restaurant_id"],
                        price: form["price"],
                        option_menu: option_menu,
                        menu_type: "main",
                        menu_picture: form["menu_picture"],
                        set_second_dish: form["set_second_dish"].to_i
        )
    end

    def self.update_data form, option_menu
        if form["menu_picture"].blank?
            menu = Menu.update(form["update_id"],
                menu_name: form["menu"],
                description: form["description"],
                restaurant_id: form["restaurant_id"],
                price: form["price"],
                option_menu: option_menu,
                menu_type: "main",
                set_second_dish: form["set_second_dish"].to_i
            )
        else
            menu = Menu.update(form["update_id"],
                menu_name: form["menu"],
                description: form["description"],
                restaurant_id: form["restaurant_id"],
                price: form["price"],
                option_menu: option_menu,
                menu_type: "main",
                set_second_dish: form["set_second_dish"].to_i,
                menu_picture: form["menu_picture"]
            )
        end
    end
end
