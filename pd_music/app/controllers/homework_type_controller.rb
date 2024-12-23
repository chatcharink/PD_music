class HomeworkTypeController < ApplicationController
    def index
        return redirect_to path_to_root unless can_view_menu?([39])
    end

    def datatable
        respond_to do |format|
            format.html
            format.json { render json: HomeworkTypeDatatable.new(params, view_context: view_context) }
        end
    end

    def create
        begin
            form_homework_type = params["form_create_homework_type"]
            
            find_duplicate = HomeworkType.where(homework_type: form_homework_type["homework_type"], status: "active")
            find_duplicate = find_duplicate.where.not(id: form_homework_type["homework_type_id"]) if form_homework_type["homework_type_id"].present?
            if find_duplicate.blank?
                if form_homework_type["homework_type_id"].blank?
                    homework_type = HomeworkType.create(homework_type: form_homework_type["homework_type"], description: form_homework_type["description"])
                    state = "add"
                else
                    homework_type = HomeworkType.update(form_homework_type["homework_type_id"], homework_type: form_homework_type["homework_type"], description: form_homework_type["description"])
                    state = "update"
                end
                save_activity(state.capitalize, "Success", "#{state.capitalize} homework type: #{form_homework_type["homework_type"]} successfully")
                flash["success"] = "#{state.capitalize} homework type: #{form_homework_type["homework_type"]} successfully"
            else
                save_activity("Add", "Fail", "Cannot add homework type: #{form_homework_type["homework_type"]} because #{form_homework_type["homework_type"]} already exists")
                flash["error"] = "Category: #{form_homework_type["homework_type"]} already exists"
            end
        rescue => e
            state = form_homework_type["homework_type_id"].blank? ? "add" : "update"
            save_activity(state.capitalize, "Fail", "Cannot #{state} homework type: #{form_homework_type["homework_type"]} because something went wrong")
            flash["error"] = "Cannot add homework type because something went wrong"
        end
        respond_to do |format|
            format.json { render json: { redirect_path: homework_type_index_url() } }
        end
    end

    def edit
        homework_type = HomeworkType.find(params["id"])
        respond_to do |format|
            format.json { render json: { homework_type: homework_type.homework_type, description: homework_type.description} }
        end
    end

    def destroy
        unless can_view_menu?([72])
            flash["error"] = "You don't have permission to delete homework"
            return redirect_to path_to_root
        end
        begin
            homework_type = HomeworkType.find(params["id"]).update(status: "deleted")
            save_activity("Delete", "Success", "Delete homework type: #{params["name"]} successfully")
            flash["success"] = "Delete homework type: #{params["name"]} successfully"
            respond_to do |format|
                format.json { render json: {status: "success", redirect_path: homework_type_index_url()} }
            end
        rescue => e
            save_activity("Delete", "Fail", "Cannot delete data")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end
end
