class AddSendDateToHomeworkUserMapping < ActiveRecord::Migration[7.0]
  def change
    add_column :homework_user_mappings, :send_date, :datetime
  end
end
