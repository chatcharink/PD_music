class CategoryController < ApplicationController
    def index
        return redirect_to path_to_root unless can_view_menu?([39])
    end

    def datatable
        respond_to do |format|
            format.html
            format.json { render json: CategoryDatatable.new(params, view_context: view_context) }
        end
    end

    def create
        begin
            form_category = params["form_create_category"]
            color = form_category["color"].blank? ? nil : form_category["color"].gsub("#", "")
            
            find_duplicate = Category.where(name_en: form_category["category_name"], status: "active")
            find_duplicate = find_duplicate.where.not(id: form_category["category_id"]) if form_category["category_id"].present?
            if find_duplicate.blank?
                if form_category["category_id"].blank?
                    category = Category.create(name_en: form_category["category_name"], name_th: form_category["description"], status: "active", color_code: color)
                    state = "add"
                else
                    category = Category.update(form_category["category_id"], name_en: form_category["category_name"], name_th: form_category["description"], status: "active", color_code: color)
                    state = "update"
                end
                save_activity(state.capitalize, "Success", "#{state.capitalize} category: #{form_category["category_name"]} successfully")
                flash["success"] = "#{state.capitalize} category: #{form_category["category_name"]} successfully"
            else
                save_activity("Add", "Fail", "Cannot add category: #{form_category["category_name"]} because #{form_category["category_name"]} already exists")
                flash["error"] = "Category: #{form_category["category_name"]} already exists"
            end
        rescue => e
            state = form_category["category_id"].blank? ? "add" : "update"
            save_activity(state.capitalize, "Fail", "Cannot #{state} category: #{form_category["category_name"]} because something went wrong")
            flash["error"] = "Cannot add category because something went wrong"
        end
        respond_to do |format|
            format.json { render json: { redirect_path: category_index_url() } }
        end
    end

    def edit
        category = Category.find(params["id"])
        respond_to do |format|
            format.json { render json: { category: category.name_en, description: category.name_th, color: category.color_code, update_path: category_path(format: :json, id: category.id) } }
        end
    end

    def destroy
        unless can_view_menu?([68])
            flash["error"] = "You don't have permission to delete category"
            return redirect_to path_to_root
        end
        begin
            category = Category.find(params["id"]).update(status: "deleted")
            save_activity("Delete", "Success", "Delete category: #{params["name"]} successfully")
            flash["success"] = "Delete category: #{params["name"]} successfully"
            respond_to do |format|
                format.json { render json: {status: "success", redirect_path: category_index_url()} }
            end
        rescue => e
            save_activity("Delete", "Fail", "Cannot delete data")
            respond_to do |format|
                format.json { render json: {status: "error", message: "Something was wrong. Please contact admin"} }
            end
        end
    end
end
