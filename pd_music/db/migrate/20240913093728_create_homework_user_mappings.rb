class CreateHomeworkUserMappings < ActiveRecord::Migration[7.0]
  def change
    create_table :homework_user_mappings do |t|
      t.bigint :homework_id, limit: 20
      t.bigint :user_id, limit: 20
      t.column :status, "ENUM('open', 'send', 'reject', 'checked') DEFAULT 'open'"
      t.integer :score, limit: 5
      t.timestamps
    end
  end
end
