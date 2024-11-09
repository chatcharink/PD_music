class CreateHomeworkTypes < ActiveRecord::Migration[7.0]
  def change
    create_table :homework_types do |t|
      t.string :homework_type, limit: 250
      t.text :description
      t.column :status, "ENUM('active', 'inactive', 'deleted') DEFAULT 'active'"
      t.timestamps
    end
  end
end
