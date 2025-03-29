class CreateHomeworks < ActiveRecord::Migration[7.0]
  def change
    create_table :homeworks do |t|
      t.string :task_name, limit: 250
      t.bigint :category_id, limit: 20
      t.bigint :question_id, limit: 20
      t.column :status, "ENUM('active', 'inactive', 'deleted') DEFAULT 'active'"
      t.string :estimate_date, limit: 50
      t.timestamps
    end
  end
end
