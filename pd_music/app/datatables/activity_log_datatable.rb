class ActivityLogDatatable < ApplicationDatatable
    def_delegators :@view
  
    def initialize(params, opts = {})
        @view = opts[:view_context]
        super
    end
  
    def view_columns
        # Declare strings in this format: ModelName.column_name
        # or in aliased_join_table.column_name format
        @view_columns ||= {
            name: { source: "activity_logs.user_id", cond: :eq },
            device: { source: "activity_logs.device", cond: :like },
            action: { source: "activity_logs.action_name", cond: :like},
            result: { source: "activity_logs.action_result", cond: :like},
            detail: { source: "activity_logs.action_detail", cond: :like},
            datetime: { source: "activity_logs.action_datetime", cond: :like}
        }
    end
  
    def data
        records.map do |record|
            {
            name: get_name(record.firstname, record.lastname),
            device: record.device,
            action: "#{record.action_name}",
            result: record.action_result,
            detail: record.action_detail,
            datetime: record.action_datetime.strftime("%d/%m/%Y %H:%M:%S")
            }
        end
    end
  
    def get_raw_records
        # insert query here
        activity = ActivityLog.select("activity_logs.*, users.firstname, users.lastname").all
        activity = activity.joins("left join users on users.id = activity_logs.user_id").order(action_datetime: :DESC)
    end

    def get_name firstname, lastname
        if firstname.present?
            name = "#{firstname.capitalize} #{lastname}"
        else
            name = "-"
        end
    end
  
end
  