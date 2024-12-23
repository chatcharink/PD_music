class FoodController < ApplicationController
    require 'yaml'
    include FoodHelper

    def index
        unless can_view_menu?([43])
            flash["error"] = "You don't have permission to view order"
            return redirect_to path_to_root
        end
        ymal_path = APP_CONFIG[:order_setting_path]
        @order_setting = YAML.load(File.read("#{ymal_path}/setting_order.yml"))  
        @hash_order = Hash.new
        if session["current_user"]["role"] != 1
            order = Menu.select("orders.date, orders.optional, orders.has_second_order, orders.second_menu_id, orders.total_price, orders.more_detail, orders.meal, menus.*, restaurants.restaurant_name")
            order = order.joins("left join restaurants on restaurants.id = menus.restaurant_id")
            order = order.joins("right join orders on orders.menu_id = menus.id")
            order = order.where("orders.user_id = ?", session["current_user"]["id"])
            order = order.order("orders.date DESC")

            order.each do |ord|
                date = ord.date.strftime("%d/%m/%Y")
                @hash_order[date] ||= []
                @hash_order[date] << {"restaurant": ord.restaurant_name, "menu_name": ord.menu_name, "menu_image": ord.menu_picture, "option": JSON.parse(ord.optional), "second_menu_id": ord.second_menu_id, "price": ord.total_price, "more_detail": ord.more_detail, "meal": ord.meal}
            end

            if order.present?
                @option = Menu.where(menu_type: "option").or(Menu.where(set_second_dish: 1)).index_by(&:id)
            end
        else
            order = User.select("users.*, orders.date, orders.optional, orders.has_second_order, orders.second_menu_id, orders.total_price, orders.more_detail, orders.meal, menus.menu_name")
            order = order.joins("right join orders on orders.user_id = users.id")
            order = order.joins("left join menus on menus.id = orders.menu_id")
            order = order.joins("left join restaurants on restaurants.id = menus.restaurant_id")
            order = order.order("orders.date DESC")
            
            if order.present?
                option_menu = Menu.where(menu_type: "option").or(Menu.where(set_second_dish: 1)).index_by(&:id)
            end

            order.each do |ord|
                date = ord.date.strftime("%d/%m/%Y")
                menu = []
                menu << ord.menu_name
                option = JSON.parse(ord.optional)
                option.each do |op|
                    menu << option_menu[op["id"].to_i].menu_name
                end
                if !ord.second_menu_id.blank?
                    menu << " + #{option_menu[ord.second_menu_id.to_i].menu_name}"
                end
                if ord.more_detail.present?
                    menu << "(#{ord.more_detail})"
                end
                data = {"menu": menu, "price": ord.total_price, "meal": ord.meal}
                @hash_order["#{ord.firstname} #{ord.lastname}"] ||= {}
                @hash_order["#{ord.firstname} #{ord.lastname}"][date] ||= []
                @hash_order["#{ord.firstname} #{ord.lastname}"]["profile_pic"] = ord.profile_pic
                @hash_order["#{ord.firstname} #{ord.lastname}"][date] << data
            end
        end
    end

    def filter_date
        date_from = Date.parse(params["date_from"])
        date_to = Date.parse(params["date_to"])
        order = User.select("users.*, orders.date, orders.optional, orders.has_second_order, orders.second_menu_id, orders.total_price, orders.more_detail, orders.meal, menus.menu_name")
        order = order.joins("right join orders on orders.user_id = users.id")
        order = order.joins("left join menus on menus.id = orders.menu_id")
        order = order.joins("left join restaurants on restaurants.id = menus.restaurant_id")
        order = order.where("orders.date between ? and ?", date_from.strftime("%Y-%m-%d"), date_to.strftime("%Y-%m-%d"))
        order = order.order("orders.date DESC")
        
        if order.present?
            option_menu = Menu.where(menu_type: "option").or(Menu.where(set_second_dish: 1)).index_by(&:id)
        end

        @hash_order = Hash.new
        order.each do |ord|
            date = ord.date.strftime("%d/%m/%Y")
            menu = []
            menu << ord.menu_name
            option = JSON.parse(ord.optional)
            option.each do |op|
                menu << option_menu[op["id"].to_i].menu_name
            end
            if !ord.second_menu_id.blank?
                menu << " + #{option_menu[ord.second_menu_id.to_i].menu_name}"
            end
            if ord.more_detail.present?
                menu << "(#{ord.more_detail})"
            end
            data = {"menu": menu, "price": ord.total_price, "meal": ord.meal}
            @hash_order["#{ord.firstname} #{ord.lastname}"] ||= {}
            @hash_order["#{ord.firstname} #{ord.lastname}"][date] ||= []
            @hash_order["#{ord.firstname} #{ord.lastname}"]["profile_pic"] = ord.profile_pic
            @hash_order["#{ord.firstname} #{ord.lastname}"][date] << data
        end

        render(
            partial: "food/summary_all_ordered",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {date_from: date_from, date_to: date_to}
        )
    end

    def setting_order
        ymal_path = APP_CONFIG[:order_setting_path]
        hash_order = {}
        hash_order["pre_order"] = params["pre_order"]
        hash_order["times_per_day"] = params["times"]
        hash_order["meal"] = params["meals"]
        begin
            File.open("#{ymal_path}/setting_order.yml", "w") { |file| file.write(hash_order.to_yaml) }
            save_activity("Set", "Success", "Rule for order was set")
            respond_to do |format|
                format.json { render :json => {status: "success", message: "Set order rule successfully"} }
            end
        rescue => e
            save_activity("Set", "Fail", "Cannot set order rule")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Cannot add order. Please contact admin"} }
            end
        end
    end

    def export_order
        begin
            date_from = Date.parse(params["form_export"]["date_from"])
            date_to = Date.parse(params["form_export"]["date_to"])
            if (date_to - date_from).to_i >= 0
                order = Order.select("orders.*, menus.id as menu_id, menus.menu_name, menus.restaurant_id, menus.status, restaurants.restaurant_name, users.firstname, users.lastname")
                order = order.joins("left join menus on menus.id = orders.menu_id")
                order = order.joins("left join restaurants on restaurants.id = menus.restaurant_id")
                order = order.joins("left join users on users.id = orders.user_id")
                order = order.where("date between ? and ?", date_from.strftime("%Y-%m-%d"), date_to.strftime("%Y-%m-%d"))
                order = order.order(:user_id, :restaurant_id, :menu_id)

                restaurant = Restaurant.where(status: "active")
                write_order(restaurant, order)
                save_activity("Export", "Success", "Export order between #{date_from.strftime("%Y-%m-%d")} to #{date_to.strftime("%Y-%m-%d")} successfully")

                respond_to do |format|
                    format.xlsx { send_file("#{APP_CONFIG[:order_setting_path]}/order.xlsx", :disposition => 'attachment', :filename => "order.xlsx") }
                end
            else
                flash["error"] = "Your input with invalid date range"
                redirect_to food_path()
                # respond_to do |format|
                #     format.json { render :json => {status: "error", message: "Your input with invalid date range"} }
                # end
            end
        rescue => e
            p e.message
            p e.backtrace.first
            save_activity("Export", "Fail", "Export order fail because something was wrong")
            flash["error"] = "Cannot export order. Please contact admin"
            redirect_to food_path()
            # respond_to do |format|
            #     format.json { render :json => {status: "error", message: "Cannot export order. Please contact admin"} }
            # end
        end
    end

    def add_coupon
        begin
            if params["user_id"] == "all"
                user = User.where.not(status: "deleted")
                user.each do |u|
                    coupon = u.coupon.to_i
                    coupon += params["amount"].to_i
                    User.update(u.id, coupon: coupon)
                    if u.id == session["current_user"]["id"]
                        session["current_user"]["coupon"] = coupon
                    end
                end
            else
                user = User.find(params["user_id"])
                coupon = user.coupon.to_i
                coupon += params["amount"].to_i
                user.update(coupon: coupon)
                if params["user_id"].to_i == session["current_user"]["id"]
                    session["current_user"]["coupon"] = coupon
                end
            end
            save_activity("Add", "Success", "Add coupon +#{params["amount"].to_i} to user(s) successfully")
            respond_to do |format|
                format.json { render :json => {status: "success", message: "Add amount : #{params["amount"]} to user successfully."} }
            end
        rescue => e
            save_activity("Add", "Fail", "Fail to add coupon to user(s)")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Cannot add coupon. Please contact admin"} }
            end
        end
    end

    def order
        @restaurant = Restaurant.where(status: "active")
        @option_category = Menu.select(:option_category).where(menu_type: "option").group(:option_category)
        # if session["current_user"]["role"] > 1
        @order = Menu.select("menus.*, orders.optional, orders.total_price, orders.second_menu_id, orders.id as order_id, orders.meal, orders.more_detail").joins("right join orders on orders.menu_id = menus.id")
        @order = @order.where("orders.user_id = ? and orders.date = ?", session["current_user"]["id"], DateTime.now.strftime("%Y-%m-%d"))
        @order = @order.where("menus.status = ?", "active")
        if @order.present?
            @option = Menu.where(menu_type: "option").or(Menu.where(set_second_dish: 1)).index_by(&:id)
        end

        ymal_path = APP_CONFIG[:order_setting_path]
        @order_setting = YAML.load(File.read("#{ymal_path}/setting_order.yml"))

        # else
        #    @order = Menu.select("menus.*").joins("right join orders on orders.menu_id = menus.id")
        #    @order = @order.where("orders.date = ?", DateTime.now)
        # end

        # if params["id"].blank?
        # @default_restaurant = @restaurant.first
        # else
            # @restaurant = @restaurant.where("")
        # end
    end

    def get_menu_order
        menu = Menu.where(menu_name: params["menu"], restaurant_id: params["restaurant_id"]).first
        @option_menu = Menu.where(menu_type: "option").index_by(&:id)
        image_path = menu.menu_picture.attached? ? url_for(menu.menu_picture) : "#{APP_CONFIG[:application_path]}/pictures/no_image.jpg"
        @second_dish = Menu.where(restaurant_id: params["restaurant_id"], set_second_dish: 1)
        render(
            partial: "food/order_menu",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {image_path: image_path, menu_name: menu.menu_name, menu_id: menu.id, price: menu.price, option: JSON.parse(menu.option_menu)}
        )
    end

    def confirm_order
        action = params["update_id"].blank? ? "Add" : "Update"
        begin
            date = Date.parse(params["date"])
            if (session["current_user"]["coupon"] - params["price"].to_i) > 0
                if params["update_id"].blank?
                    order = Order.insert_data(params, session)
                    save_activity("Add", "Success", "Add order of meal: #{params["meal"]} successfully")
                else
                    has_second = params["has_second"] ? 1 : 0
                    json_option = params["option"].present? ? JSON.parse(params["option"].to_json) : {}
                    order = Order.update(params["update_id"],
                        menu_id: params["menu_id"],
                        optional: json_option,
                        has_second_order: has_second,
                        second_menu_id: params["second_menu_id"],
                        total_price: params["price"],
                        more_detail: params["detail"]
                    )
                    save_activity("Update", "Success", "Update order of meal: #{params["meal"]} successfully")
                end
                if order
                    coupon = session["current_user"]["coupon"] - params["price"].to_i
                    User.find(session["current_user"]["id"]).update(coupon: coupon)
                    session["current_user"]["coupon"] = coupon
                    @restaurant = Restaurant.where(status: "active")
                    @order = Menu.select("menus.*, orders.optional, orders.total_price, orders.second_menu_id, orders.id as order_id, orders.meal, orders.more_detail").joins("right join orders on orders.menu_id = menus.id")
                    @order = @order.where("orders.user_id = ? and orders.date = ?", session["current_user"]["id"], date.strftime("%Y-%m-%d"))
                    @order = @order.where("menus.status = ?", "active")
                    @order = @order.where("orders.meal = ?", params["meal"])
                    ymal_path = APP_CONFIG[:order_setting_path]
                    @order_setting = YAML.load(File.read("#{ymal_path}/setting_order.yml"))
                    if @order.present?
                        @option = Menu.where(menu_type: "option").or(Menu.where(set_second_dish: 1)).index_by(&:id)
                        @option_category = Menu.select(:option_category).where(menu_type: "option").group(:option_category)
                    end
                    render(
                        partial: "food/select_for_order",
                        formats: [:html, :js, :json, :url_encoded_form]
                    )
                else
                    save_activity(action, "Fail", "Fail to confirm order because database was wrong")
                    respond_to do |format|
                        format.json { render :json => {status: "error", message: "Cannot add order. Please contact admin"} }
                    end
                end
            else
                save_activity(action, "Fail", "Fail to confirm order because your coupon is not enough")
                respond_to do |format|
                    format.json { render :json => {status: "error", message: "Cannot order because your coupon is not enough"} }
                end
            end
        rescue => e
            p e.message
            p e.backtrace.first
            save_activity(action, "Fail", "Fail to confirm order because something was wrong")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Something went wrong. Please contact admin"} }
            end
        end
    end

    def change_date
        @restaurant = Restaurant.where(status: "active")
        @option_category = Menu.select(:option_category).where(menu_type: "option").group(:option_category)
        ymal_path = APP_CONFIG[:order_setting_path]
        @order_setting = YAML.load(File.read("#{ymal_path}/setting_order.yml"))
        if params["date"].present?
            date = Date.parse(params["date"])
            @order = Menu.select("menus.*, orders.optional, orders.total_price, orders.second_menu_id, orders.id as order_id, orders.meal, orders.more_detail").joins("right join orders on orders.menu_id = menus.id")
            @order = @order.where("orders.user_id = ? and orders.date = ?", session["current_user"]["id"], date.strftime("%Y-%m-%d"))
            @order = @order.where("menus.status = ?", "active")
        end
        
        @order = @order.where("orders.meal = ?", params["meal"]) if params["meal"].present? && params["meal"] != "All"
        @order = @order.where.not("orders.id = ?", params["id"]) if params["id"].present?
        @option = Menu.where(menu_type: "option").or(Menu.where(set_second_dish: 1)).index_by(&:id) if @order.present?
        
        render(
            partial: "food/select_for_order",
            formats: [:html, :js, :json, :url_encoded_form]
        )
        #@default_restaurant = @restaurant.first
    end

    def restaurant
        unless can_view_menu?([46])
            flash["error"] = "You don't have permission to view restaurant"
            return redirect_to path_to_root
        end
        @restaurant = Restaurant.where.not(status: "deleted")
        option_menu = Menu.where(menu_type: "option")
        @option_category = Menu.select(:option_category).where(menu_type: "option").group(:option_category)
        # @h_option = Hash.new()
        # option_menu.each do |op|
        #     @h_option[op.option_category] ||= []
        #     @h_option[op.option_category] << [op.id]
        # end
    end

    def create
        form_restaurant = params["form_create_restaurant"]
        action = form_restaurant["update_id"].blank? ? "Add" : "Update"
        begin
            restaurant = form_restaurant["update_id"].blank? ? Restaurant.insert_data(form_restaurant) : Restaurant.update_data(form_restaurant)
            if restaurant
                save_activity(action, "Success", "#{action} restaurant : #{form_restaurant["restaurant"]} successfully")
                @restaurant = Restaurant.where.not(status: "deleted")
                render(
                    partial: "food/restaurant_list",
                    formats: [:html, :js, :json, :url_encoded_form]
                )
            else
                save_activity(action, "Fail", "Fail to #{action.downcase} restaurant because database was wrong")
                respond_to do |format|
                    format.json { render :json => {status: "error", message: "Cannot add restaurant. Please contact admin"} }
                end
            end
        rescue => e
            save_activity(action, "Fail", "Fail to #{action.downcase} restaurant because something was wrong")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Something went wrong. Please contact admin"} }
            end
        end
    end

    def menu_list
        unless can_view_menu?([49])
            flash["error"] = "You don't have permission to view menu"
            return redirect_to path_to_root
        end
        @restaurant = Restaurant.select("restaurants.restaurant_name, menus.menu_name").where(id: params["id"])
        @restaurant = @restaurant.joins("left join menus on menus.restaurant_id = restaurants.id").first

        @option_category = Menu.select(:option_category).where(menu_type: "option").group(:option_category)
    end

    def menu_datatable
        respond_to do |format|
            format.html
            format.json { render json: MenuDatatable.new(params, view_context: view_context) }
        end
    end

    def create_menu
        form_menu = params["form_create_menu"]
        page = params["form_create_menu"]["page"]
        action = params["form_create_menu"]["update_id"].blank? ? "Add" : "Update"
        begin
            json_option = params["option_menu"].blank? ? nil : JSON.parse(params["option_menu"].to_json)
            if params["form_create_menu"]["update_id"].blank?
                menu = Menu.insert_data(form_menu, json_option)
            else
                menu = Menu.update_data(form_menu, json_option)
            end
            if menu
                @restaurant = Restaurant.select("restaurants.restaurant_name, menus.menu_name").where(id: params["form_create_menu"]["restaurant_id"])
                @restaurant = @restaurant.joins("left join menus on menus.restaurant_id = restaurants.id").first
                @option_category = Menu.select(:option_category).where(menu_type: "option").group(:option_category)
                render_page = page == "menu" ? "food/table_menu" : "food/add_menu_dialog"
                save_activity(action, "Success", "#{action} menu : #{form_menu["menu"]} successfully")
                render(
                    partial: "food/table_menu",
                    formats: [:html, :js, :json, :url_encoded_form],
                    locals: {page: page, restaurant_id: params["form_create_menu"]["restaurant_id"]}
                )
            else
                save_activity(action, "Fail", "Fail to #{action.downcase} menu because database was wrong")
                respond_to do |format|
                    format.json { render :json => {status: "error", message: "Cannot add menu. Please contact admin"} }
                end
            end
        rescue => e
            p e.message
            p e.backtrace.first
            save_activity(action, "Fail", "Fail to #{action.downcase} menu because something was wrong")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Something went wrong. Please contact admin"} }
            end
        end
    end

    def create_option
        begin
            json_option = params["option"]
            json_option.each do |o|
                if o["id"].blank?
                    action = "Add"
                    Menu.create(menu_name: o["option_name"], price: o["price"].to_i, menu_type: "option", option_category: params["category"])
                else
                    action = "Update"
                    Menu.update(o["id"], menu_name: o["option_name"], price: o["price"].to_i, menu_type: "option", option_category: params["category"])
                end
            end
            save_activity("Update", "Success", "Update option menu : #{params["category"]} successfully")
            option_menu = Menu.where(menu_type: "option")
            @option_category = Menu.select(:option_category).where(menu_type: "option").group(:option_category)
            # @h_option = Hash.new()
            # option_menu.each do |op|
            #     @h_option[op.option_category] ||= []
            #     @h_option[op.option_category] << [op.id]
            # end
            render(
                partial: "food/add_option_menu",
                formats: [:html, :js, :json, :url_encoded_form]
            )
            
        rescue => e
            p e.message
            p e.backtrace.first
            save_activity("Update", "Fail", "Fail to update option menu because something was wrong")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Something went wrong. Please contact admin"} }
            end
        end
    end

    def get_option
        option_menu = Menu.where(menu_type: "option", option_category: params["category"])
        options = []
        option_menu.each do |o|
            options << [o.menu_name, o.price, o.id]
        end

        respond_to do |format|
            format.json { render :json => {options: options} }
        end
    end

    def get_menu
        menu = Menu.where(menu_name: params["menu"], restaurant_id: params["restaurant_id"]).first
        menu_picture = menu.menu_picture.attached? ? url_for(menu.menu_picture) : "#{APP_CONFIG[:application_path]}/pictures/no_image.jpg"
        is_second = menu.set_second_dish > 0 ? true : false

        respond_to do |format|
            format.json { render :json => {id: menu.id, image_path: menu_picture, menu: menu.menu_name, description: menu.description, price: menu.price, option: JSON.parse(menu.option_menu), is_second: is_second} }
        end
    end

    def update_status
        begin
            status = params["status"] ? "active" : "inactive"
            menu = Menu.find(params["menu_id"])
            menu.update(status: status)
            save_activity("Update", "Success", "Update menu status successfully")
            respond_to do |format|
                format.json { render :json => {status: "success", message: "Update menu status successfully"} }
            end
        rescue => e
            save_activity("Update", "Fail", "Fail to update menu because something was wrong")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Something went wrong. Please contact admin"} }
            end
        end
    end

    def update_restaurant_status
        begin
            status = params["status"] ? "active" : "inactive"
            restaurant = Restaurant.find(params["restaurant_id"])
            restaurant.update(status: status)
            save_activity("Update", "Success", "Update restaurant status successfully")
            respond_to do |format|
                format.json { render :json => {status: "success", message: "Update restaurant status successfully"} }
            end
        rescue => e
            save_activity("Update", "Fail", "Fail to update restaurant because something was wrong")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Something went wrong. Please contact admin"} }
            end
        end
    end

    def destroy
        begin
            restaurant = Restaurant.find(params["id"])
            restaurant.update(status: "deleted")
            @restaurant = Restaurant.where.not(status: "deleted")
            save_activity("Delete", "Success", "Delete restaurant successfully")
            render(
                partial: "food/restaurant_list",
                formats: [:html, :js, :json, :url_encoded_form]
            )
        rescue => e
            save_activity("Delete", "Fail", "Fail to delete restaurant because something was wrong")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Something went wrong. Please contact admin"} }
            end
        end
    end

    def destroy_order
        begin
            order = Order.find(params["id"])
            coupon = session["current_user"]["coupon"] + order.total_price
            session["current_user"]["coupon"] = coupon
            update_user = User.find(order.user_id).update(coupon: coupon)
            order.destroy
            save_activity("Delete", "Success", "Delete order meal : #{params["name"]} successfully")
            flash["success"] = "Delete order meal : #{params["name"]} successfully"
            respond_to do |format|
                format.json { render :json => {status: "success" } }
            end
        rescue => e
            save_activity("Delete", "Fail", "Fail to delete order because something was wrong")
            respond_to do |format|
                format.json { render :json => {status: "error", message: "Something went wrong. Please contact admin"} }
            end
        end
    end
end
