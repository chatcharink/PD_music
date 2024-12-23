class ApplicationController < ActionController::Base
    protect_from_forgery with: :null_session
    helper_method :is_user_logged_in?, :can_view_menu?, :can_access_action?, :path_to_root
    before_action :is_user_logged_in? #, :except => [:session_expired, :service_connection]
    add_flash_types :info, :error, :success, :warning
    require "date"
    require "json"
    require "socket"

    def is_user_logged_in?
        return redirect_to login_path() if session["current_user"].blank? && params[:controller] != "login"
    end

    def can_view_menu? permission_id
        begin
            has_permission = []
            permission_id.each do |pms|
                has_permission << session["permission_roles"].include?(pms)
            end
            
            return !has_permission.include?(false)
        rescue => e
            flash["error"] = "Force logout because your session is blank"
            redirect_to login_path()
        end
    end

    def can_access_action? permission_id
        has_permission = []
        permission_id.each do |pms|
            has_permission << session["permission_roles"].include?(pms)
        end
        
        if has_permission.include?(false)
            return redirect_to path_to_root
        end
    end

    def path_to_root
        if session["permission_roles"].include?(1)
            return root_path()
        elsif session["permission_roles"].include?(39) || session["permission_roles"].include?(40) 
            return homework_index_path()
        elsif session["permission_roles"].include?(41)
            return report_path()
        elsif session["permission_roles"].include?(17)
            return participation_index_path()
        elsif session["permission_roles"].include?(43)
            return food_path()
        else
            session.delete "current_user"
            session.delete "permission_roles"
            session.delete "inactive_user"
            flash["error"] = "We're sorry you do not have permission to access to website. Please contact admin"
            return login_path()
        end
    end

    def save_activity action, result, detail
        if session["current_user"].blank?
            user = nil
            role = nil
        else
            user = session["current_user"]["id"]
            role = session["current_user"]["role"]
        end
        
        agent = request.user_agent
        device ||= agent.slice!(agent.index("(")+1..agent.index(")")-1).gsub(';','')
        ip_addr = request.remote_ip

        ActivityLog.create(user_id: user,
            user_role_id: role,
            device: device,
            detected_ip: ip_addr,
            action_name: action,
            action_result: result,
            component: "PD music",
            action_detail: detail,
            action_datetime: DateTime.now()
        )
    end
end
