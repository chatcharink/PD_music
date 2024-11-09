class NotificationController < ApplicationController
    def index
        return redirect_to path_to_root unless can_view_menu?([9, 10, 11, 12, 13])
        noti_permission = Permission.where(controller_name: "Notification")
        arr_permission_id = noti_permission.pluck(:id)
        noti_permission_roles = PermissionAndRole.where(permission_id: arr_permission_id)

        noti_permission_of_role = Hash.new()
        @notification = Hash.new()

        noti_permission_of_role["allow_id"] = []

        noti_permission_roles.each do |pr| 
            noti_permission_of_role["allow_id"] << pr.permission_id
            noti_permission_of_role["#{pr.permission_id}"] = pr.id
        end
        
        noti_permission.each { |noti| @notification["#{noti.id}_#{noti.function_name}"] = noti_permission_of_role["#{noti.id}"] }
    end

    def save_notification_setting
        notification_setting = params["notification"]
        insert_data = []
        delete_id = []

        notification_setting.each do |noti|
            if noti["id"].blank? || noti["id"] == "0"
                ## Insert
                insert_data << {role_id: 2, permission_id: noti["permission_id"].to_i} if noti["status"] == 1
            else
                ## Delete
                delete_id << noti["id"] if noti["status"] == 0
            end
        end

        begin
            if insert_data.length > 0
                PermissionAndRole.create(insert_data)
            end

            if delete_id.length > 0
                PermissionAndRole.destroy(delete_id)
            end
            flash[:success] = "Update notification setting successfully."
            respond_to do |format|
                format.json { render :json => {state: "success"} }
            end
        rescue => e
            p e.message
            flash[:error] = "Fail to update notification setting. Please contact admin"
            respond_to do |format|
                format.json { render :json => {state: "error", message: e.message} }
            end
        end
    end

    def filter
        noti = Notification.where(user_id: session["current_user"]["id"])

        if params["type"].present?
            noti = noti.where(notification_type: params["type"])
        end

        render(
            partial: "layouts/notification",
            formats: [:html, :js, :json, :url_encoded_form],
            locals: {notification: noti}
        )
    end
end
