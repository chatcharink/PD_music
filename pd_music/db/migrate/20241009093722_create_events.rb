class CreateEvents < ActiveRecord::Migration[7.0]
  def change
    create_table :events do |t|
      t.string :event_name, limit: 250
      t.text :description
      t.date :event_date
      t.column :status, "ENUM('active', 'inactive', 'deleted') DEFAULT 'active'"
      t.bigint :created_by, limit: 20
      t.timestamps
    end
  end
end
