class ActivityLogController < ApplicationController
    def index
        return redirect_to path_to_root unless can_view_menu?([39])
    end

    def datatable
        respond_to do |format|
            format.html
            format.json { render json: ActivityLogDatatable.new(params, view_context: view_context) }
        end
    end
end
