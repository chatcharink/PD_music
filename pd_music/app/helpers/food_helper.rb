module FoodHelper
    require 'rubygems'
    require 'write_xlsx'

    def write_order restaurant, order
        arr_characters = ("A".."Z").to_a
        hash_restaurant = restaurant.index_by(&:id)
        arr_restaurant = restaurant.pluck(:id)
        hash_summary = {}
        option_menu = Menu.where(menu_type: "option").or(Menu.where(set_second_dish: 1)).index_by(&:id)
        workbook = WriteXLSX.new("#{APP_CONFIG[:order_setting_path]}/order.xlsx")
        worksheet = workbook.add_worksheet

        # Add and define a format
        format = workbook.add_format
        format.set_bold
        # format.set_color('red')
        format.set_align('center')

        format_summary = workbook.add_format
        format_summary.set_bold

        # Write header
        worksheet.write('A1', "Date", format)
        worksheet.write('B1', "Name", format)
        restaurant.each_with_index { |r, index| worksheet.write("#{arr_characters[index+2]}1", r.restaurant_name, format) }

        order.each_with_index do |ord, index|
            worksheet.write("A#{index+2}", "#{ord.date.strftime("%d/%m/%Y")}")
            worksheet.write("B#{index+2}", "#{ord.firstname} #{ord.lastname}")
            restaurant_index = arr_restaurant.find_index(ord.restaurant_id)
            menu = []
            menu << ord.menu_name
            option = JSON.parse(ord.optional)
            option.each do |op|
                menu << option_menu[op["id"].to_i].menu_name
            end
            if !ord.second_menu_id.blank?
                menu << "+ #{option_menu[ord.second_menu_id.to_i].menu_name}"
            end
            worksheet.write("#{arr_characters[restaurant_index+2]}#{index+2}", menu.join(" "))

            #### Summary
            hash_summary["store_#{ord.restaurant_id}"] ||= {}
            hash_summary["store_#{ord.restaurant_id}"][menu.join(" ")] ||= {}
            hash_summary["store_#{ord.restaurant_id}"][menu.join(" ")]["number"] ||= 0
            hash_summary["store_#{ord.restaurant_id}"][menu.join(" ")]["number"] += 1
            hash_summary["store_#{ord.restaurant_id}"][menu.join(" ")]["total"] ||= 0 
            hash_summary["store_#{ord.restaurant_id}"][menu.join(" ")]["total"] += ord.total_price
            hash_summary["totally"] ||= 0
            hash_summary["totally"] += ord.total_price
        end

        length = order.length + 3
        hash_summary.each_with_index do |(key, value), index|
            next if key == "totally"
            restaurant_id = key.gsub("store_", "")
            worksheet.write("A#{(length)+index}", "ร้าน : #{hash_restaurant[restaurant_id.to_i].restaurant_name}, โทรศัพท์: #{hash_restaurant[restaurant_id.to_i].telephone_no}, line ID: #{hash_restaurant[restaurant_id.to_i].line_id}", format_summary)
            worksheet.write("A#{(length)+index+1}", "เมนู", format_summary)
            worksheet.write("B#{(length)+index+1}", "จำนวน", format_summary)
            worksheet.write("C#{(length)+index+1}", "ราคา", format_summary)
            menu_length = (length)+index+1
            length += 1
            value.each_with_index do |(k, v), i|
                worksheet.write("A#{menu_length+(i+1)}", "#{k}")
                worksheet.write("B#{menu_length+(i+1)}", "#{v["number"]}")
                worksheet.write("C#{menu_length+(i+1)}", "#{v["total"]}")
                length += 1
            end

            length += 1 if hash_summary.length-1 == index
        end

        worksheet.write("A#{(length)+3}", "Total", format_summary)
        worksheet.write("C#{(length)+3}", hash_summary["totally"], format_summary)
        workbook.close
    end

    def get_user
        user = User.where.not(status: "deleted")
        arr_user = [["All", "all"]]
        user.each { |u| arr_user << ["#{u.firstname} #{u.lastname}", u.id] }
        arr_user
    end

    def get_select_meal meal
        meal.insert(0, "All")
    end
    
    def get_select_date pre_order
        timenow = DateTime.now();
        arr_select_date = [timenow.strftime("%d/%m/%Y")]
        while arr_select_date.length < pre_order.to_i
            arr_select_date << (timenow + arr_select_date.length).strftime("%d/%m/%Y")
        end
        arr_select_date
    end

    def get_select_status
        [["Order", "active"], ["Locked", "inactive"], ["Delete", "delete"]]
    end
end
