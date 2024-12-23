class MenuDatatable < ApplicationDatatable
    def_delegators :@view, :edit_user_path, :user_path, :food_menu_update_status_path, :can_view_menu?, :session
  
    def initialize(params, opts = {})
        @view = opts[:view_context]
        super
    end
  
    def view_columns
        # Declare strings in this format: ModelName.column_name
        # or in aliased_join_table.column_name format
        @view_columns ||= {
            picture: { source: "Menu.id", cond: :eq },
            menuName: { source: "Menu.menu_name", cond: :like },
            price: { source: "Menu.price", cond: :eq},
            status: { source: "Menu.status", cond: :eq}
        }
    end
  
    def data
        records.map do |record|
            {
                picture: get_menu_pic(record.menu_picture),
                menuName: get_menu(record.menu_name, record.description),
                price: "#{record.price} บาท",
                status: get_status(record.id, record.status)
            }
        end
    end
  
    def get_raw_records
        # insert query here
        menu = Menu.where(restaurant_id: params["id"]).where.not(status: "deleted")
        menu
    end

    def get_status menu_id, status
        is_check = status == "active" ? "checked" : ""
        is_disable = can_view_menu?([50]) ? "" : "disabled"
        checkbox = []
        checkbox << "<div class=\"form-check form-switch\">"
        checkbox << "<input class=\"form-check-input\" type=\"checkbox\" id=\"menu-status-#{menu_id}\" value=\"#{menu_id}\" data-action=\"change->menu#changeStatus\" data-menu-id-param=\"#{menu_id}\" data-menu-url-param=\"#{ food_menu_update_status_path }\" #{is_check} #{is_disable}>"
        checkbox << "</div>"
        checkbox.join(" ").html_safe
    end

    def get_menu menu, description
        rows = []
        rows << menu
        rows << "<p class=\"menu-description\">#{description}</p>"
        rows.join(" ").html_safe
    end
  
    def get_menu_pic picture
        # thumbnail = '<%= image_tag(picture.attached? ? picture : "/pictures/logo.png") %>'
        picture_path = picture.attached? ? url_for(picture) : "#{APP_CONFIG[:application_path]}/pictures/no_image.jpg"
        thumbnail = "<img src='#{picture_path}' class='rounded-circle border' width='75px' height='75px' />"
        thumbnail.html_safe
    end
  
end
  