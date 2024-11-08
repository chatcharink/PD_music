class AddColumnCouponToUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :coupon, :integer, default: 0
  end
end
