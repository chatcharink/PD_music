class CreateSubjects < ActiveRecord::Migration[7.0]
  def change
    create_table :subjects do |t|
      t.string :subject_name, limit: 250
      t.text :description
      t.column :status, "ENUM('active', 'inactive', 'deleted') DEFAULT 'active'"
      t.bigint :created_by, limit: 20
      t.timestamps
    end
  end
end
