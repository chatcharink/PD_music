class CreateRoles < ActiveRecord::Migration[7.0]
  def change
    create_table :roles do |t|
      t.string :role_name, limit: 150
      t.string :description, limit: 250
      t.timestamps
    end
  end
end
