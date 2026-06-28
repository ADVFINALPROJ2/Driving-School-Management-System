# frozen_string_literal: true

class PayrollEntryPolicy < ApplicationPolicy
  def index?
    user.admin? || user.instructor? || user.clerk?
  end

  def show?
    own_record? || user.admin? || user.clerk?
  end

  private

  def own_record?
    user.instructor? && record.user_id == user.id
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.admin? || user.clerk?
        scope.all
      elsif user.instructor?
        scope.where(user_id: user.id)
      else
        scope.none
      end
    end
  end
end
