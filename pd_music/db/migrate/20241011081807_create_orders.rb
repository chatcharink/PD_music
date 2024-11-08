class CreateOrders < ActiveRecord::Migration[7.0]
  def change
    create_table :orders do |t|
      t.bigint :menu_id, limit: 20
      t.bigint :user_id, limit: 20
      t.datetime :date
      t.text :optional
      t.integer :has_second_order, limit: 5
      t.bigint :second_menu_id, limit: 20
      t.integer :total_price
      t.timestamps
    end
  end
end
