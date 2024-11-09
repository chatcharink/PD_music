class CreatePermissionAndRoles < ActiveRecord::Migration[7.0]
  def change
    create_table :permission_and_roles do |t|
      t.bigint :role_id, limit: 20
      t.bigint  :permission_id, limit: 20
      t.timestamps
    end
  end
end
