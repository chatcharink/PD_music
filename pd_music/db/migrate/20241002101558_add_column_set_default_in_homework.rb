class AddColumnSetDefaultInHomework < ActiveRecord::Migration[7.0]
  def change
    add_column :homeworks, :is_default, :integer, limit: 2
    add_column :homeworks, :priority, :bigint, limit: 20
  end
end
