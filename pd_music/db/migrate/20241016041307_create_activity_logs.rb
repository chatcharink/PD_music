class CreateActivityLogs < ActiveRecord::Migration[7.0]
  def change
    create_table :activity_logs do |t|
      t.bigint :user_id, :limit => 20, :unsigned => true
      t.bigint :user_role_id, :limit => 20, :unsigned => true
      t.string :device
      t.string :detected_ip, :limit => 150
      t.string :action_name, :limit => 150
      t.string :action_result, :limit => 50
      t.string :component, :limit => 150
      t.text :action_detail
      t.datetime :action_datetime
      t.timestamps
    end
  end
end
