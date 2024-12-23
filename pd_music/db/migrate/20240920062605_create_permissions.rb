class CreatePermissions < ActiveRecord::Migration[7.0]
  def change
    create_table :permissions do |t|
      t.string :controller_name
      t.string  :action
      t.string :function_name
      t.text :description
      t.timestamps
    end
  end
end
