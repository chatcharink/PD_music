class AddColumnMealToOrders < ActiveRecord::Migration[7.0]
  def change
    add_column :orders, :meal, :string, limit: 150
    add_column :orders, :more_detail, :text
  end
end
