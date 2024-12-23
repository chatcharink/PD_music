class PermissionController < ApplicationController
    def index
        return redirect_to path_to_root unless can_view_menu?([57])
        permission = Permission.all.order(:priority)
        permission_roles = PermissionAndRole.all
        permission_of_role = Hash.new()
        permission_roles.each do |pr|
            permission_of_role["#{pr.role_id}"] ||= {}
            permission_of_role["#{pr.role_id}"]["allow_id"] ||= []
            permission_of_role["#{pr.role_id}"]["allow_id"] << pr.permission_id
            permission_of_role["#{pr.role_id}"]["#{pr.permission_id}"] = pr.id
        end
        role = Role.all
        @permiss = Hash.new
        permission.each do |pms|
            next if pms.controller_name == "Notification"
            @permiss[pms.controller_name] ||= {}
            @permiss[pms.controller_name]["#{pms.id}_#{pms.function_name}"] ||= {}
            role.each { |r| 
                if permission_of_role["#{r.id}"].blank?
                    @permiss[pms.controller_name]["#{pms.id}_#{pms.function_name}"]["0_#{r.role_name}"] ||= 0
                else
                    id = permission_of_role["#{r.id}"]["#{pms.id}"].blank? ? "0" : permission_of_role["#{r.id}"]["#{pms.id}"]
                    @permiss[pms.controller_name]["#{pms.id}_#{pms.function_name}"]["#{id}_#{r.role_name}"] = permission_of_role["#{r.id}"]["allow_id"].include?(pms.id) ? 1 : 0
                end
            }
        end

    end

    def update_permission
        permission_data = params["permission"]
        insert_data = []
        delete_id = []
        permission_data.each do |pms|
            if pms["id"].blank? || pms["id"] == "0"
                ## Insert
                insert_data << {role_id: pms["role_id"], permission_id: pms["permission_id"].to_i} if pms["status"] == 1
                session["permission_roles"] << pms["permission_id"].to_i if (pms["role_id"].to_i == session["current_user"]["role"].to_i) && pms["status"] == 1
            else
                ## Delete
                delete_id << pms["id"] if pms["status"] == 0
                session["permission_roles"].delete(pms["permission_id"].to_i) if (pms["role_id"].to_i == session["current_user"]["role"].to_i) && pms["status"] == 0
            end
        end

        begin
            if insert_data.length > 0
                PermissionAndRole.create(insert_data)
            end

            if delete_id.length > 0
                PermissionAndRole.destroy(delete_id)
            end
            save_activity("Update permission", "Success", "Update permission successfully")
            flash[:success] = "Update permission role successfully."
            respond_to do |format|
                format.json { render :json => {state: "success"} }
            end
        rescue => e
            flash[:error] = "Fail to update permission role. Please contact admin"
            save_activity("Update permission", "Fail", "Cannot update permission")
            respond_to do |format|
                format.json { render :json => {state: "error", message: e.message} }
            end
        end
    end
end
