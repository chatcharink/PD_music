class CreateNotifications < ActiveRecord::Migration[7.0]
  def change
    create_table :notifications do |t|
      t.string :subject
      t.text :message
      t.integer :status, limit: 2
      t.bigint :send_by, limit: 20
      t.bigint  :user_id, limit: 20
      t.string  :notification_type
      t.timestamps
    end
  end
end
