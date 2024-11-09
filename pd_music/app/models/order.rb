class Order < ApplicationRecord

    def self.insert_data params, session
        has_second = params["has_second"] ? 1 : 0
        json_option = params["option"].present? ? JSON.parse(params["option"].to_json) : {}
        order = Order.create(menu_id: params["menu_id"],
            user_id: session["current_user"]["id"],
            date: params["date"],
            optional: json_option,
            has_second_order: has_second,
            second_menu_id: params["second_menu_id"],
            total_price: params["price"],
            meal: params["meal"],
            more_detail: params["detail"]
        )
    end
end
