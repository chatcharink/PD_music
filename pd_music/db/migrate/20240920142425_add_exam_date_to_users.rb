class AddExamDateToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :exam_date, :date
  end
end
