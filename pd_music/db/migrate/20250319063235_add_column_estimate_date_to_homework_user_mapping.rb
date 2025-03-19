class AddColumnEstimateDateToHomeworkUserMapping < ActiveRecord::Migration[7.0]
  def change
    add_column :homework_user_mappings, :deadline_date, :datetime
  end
end
